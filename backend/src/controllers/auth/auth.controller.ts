import { Request, Response, NextFunction } from "express";
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { createRefreshToken, revokeRefreshToken, useRefreshToken } from "../../services/token.service.js";
import crypto from "crypto";
import transporter from "../../config/mail.js";

const OTP_EXPIRY_MS = 15 * 60 * 1000;

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendOtpEmail(email: string, otp: string, purpose: "signup" | "reset") {
  const action = purpose === "signup" ? "verify your NextMeet account" : "reset your NextMeet password";
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: purpose === "signup" ? "Verify your NextMeet account" : "Your NextMeet password reset code",
    text: `Your verification code to ${action} is: ${otp}. It expires in 15 minutes.`,
  });
}

async function issueOtp(user: InstanceType<typeof User>, purpose: "signup" | "reset") {
  const otp = createOtp();
  const expiry = new Date(Date.now() + OTP_EXPIRY_MS);
  if (purpose === "signup") {
    user.signupOtpHash = hashValue(otp);
    user.signupOtpExpires = expiry;
  } else {
    user.resetPasswordOtpHash = hashValue(otp);
    user.resetPasswordExpires = expiry;
  }
  await user.save();
  await sendOtpEmail(user.email, otp, purpose);
}

function parseDurationToMs(value: string | undefined, fallbackMs: number) {
  if (!value) return fallbackMs;

  const match = String(value).trim().match(/^([0-9]+)(ms|s|m|h|d)$/i);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "ms": return amount;
    case "s": return amount * 1000;
    case "m": return amount * 60 * 1000;
    case "h": return amount * 60 * 60 * 1000;
    case "d": return amount * 24 * 60 * 60 * 1000;
    default: return fallbackMs;
  }
}

const ACCESS_TOKEN_COOKIE_MS = parseDurationToMs(process.env.ACCESS_TOKEN_EXPIRES_IN, 15 * 60 * 1000);
const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS: import("express").CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: ACCESS_TOKEN_COOKIE_MS,
};

const REFRESH_COOKIE_OPTIONS: import("express").CookieOptions = {
  ...COOKIE_OPTIONS,
  maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 7) * 24 * 60 * 60 * 1000,
};

function createAccessToken(user: { _id: unknown; role: string }) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as Secret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" } as SignOptions,
  );
}

function createSession(res: Response, user: { _id: unknown; role: string }) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(String(user._id));
  res.cookie("token", accessToken, COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return refreshToken;
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    console.log(email, name, password);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: 'Name and email cannot be empty' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists && userExists.isEmailVerified !== false) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in instead.' });
    }
    console.log(userExists);

    if (userExists) {
      await issueOtp(userExists, "signup");
      return res.status(200).json({
        message: "A new verification code has been sent to your email.",
        requiresVerification: true,
        expiresIn: OTP_EXPIRY_MS / 1000,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();
    await issueOtp(user, "signup");
    res.status(201).json({
      message: "We sent a verification code to your email.",
      requiresVerification: true,
      expiresIn: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (userExist.isEmailVerified === false) {
      return res.status(403).json({ message: "Please verify your email address before logging in." });
    }
    const isMatch = await bcrypt.compare(password, userExist.password as string);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const refreshToken = createSession(res, userExist);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
      },
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: bodyRefreshToken } = req.body as { refreshToken?: string };
    const refreshToken = bodyRefreshToken ?? req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const userId = useRefreshToken(refreshToken);
    if (!userId) {
      return res.status(401).json({ message: "Your session has expired. Please log in again." });
    }

    const user = await User.findById(userId);
    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Your session is no longer valid. Please log in again." });
    }

    const nextRefreshToken = createSession(res, user);
    res.status(200).json({ message: "Session refreshed", refreshToken: nextRefreshToken });
  } catch (error) {
    next(error);
  }
};



export const verifySignupOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
    const user = await User.findOne({ email });
    if (!email || !/^\d{6}$/.test(otp) || !user?.signupOtpHash || !user.signupOtpExpires) {
      return res.status(400).json({ message: "Please enter a valid verification code." });
    }
    if (user.signupOtpExpires.getTime() <= Date.now()) {
      return res.status(400).json({ message: "This verification code has expired. Request a new one." });
    }
    if (user.signupOtpHash !== hashValue(otp)) {
      return res.status(400).json({ message: "That verification code is incorrect." });
    }
    user.isEmailVerified = true;
    user.signupOtpHash = undefined;
    user.signupOtpExpires = undefined;
    await user.save();
    const refreshToken = createSession(res, user);
    return res.status(200).json({
      message: "Email verified successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resendSignupOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified !== false) {
      return res.status(400).json({ message: "A pending account verification was not found." });
    }
    await issueOtp(user, "signup");
    return res.status(200).json({ message: "A new verification code has been sent.", expiresIn: OTP_EXPIRY_MS / 1000 });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in and does not have a password to reset." });
    }

    await issueOtp(user, "reset");

    return res.status(200).json({
      message: "We sent a verification code to your email.",
      expiresIn: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
    const user = await User.findOne({ email });
    if (!email || !/^\d{6}$/.test(otp) || !user?.resetPasswordOtpHash || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Please enter a valid verification code." });
    }
    if (user.resetPasswordExpires.getTime() <= Date.now()) {
      return res.status(400).json({ message: "This verification code has expired. Request a new one." });
    }
    if (user.resetPasswordOtpHash !== hashValue(otp)) {
      return res.status(400).json({ message: "That verification code is incorrect." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordToken = hashValue(resetToken);
    await user.save();
    return res.status(200).json({ message: "Code verified. You can now choose a new password.", resetToken });
  } catch (error) {
    next(error);
  }
};

export const resendResetOtp = forgotPassword;

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const resetToken = typeof req.body.resetToken === "string" ? req.body.resetToken : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (password.length < 6) return res.status(400).json({ message: "Your password must be at least 6 characters long." });
    const user = await User.findOne({ email });
    if (!user?.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() <= Date.now() || user.resetPasswordToken !== hashValue(resetToken)) {
      return res.status(400).json({ message: "Your password reset session has expired. Please request a new code." });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Your password has been reset. Please log in." });
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as import("../../models/user.model").IUser | undefined;

    if (!user) return res.status(401).json({ message: "Google authentication failed" });
    createSession(res, user);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    res.status(500).json({ message: 'Error during Google authentication', error });
  }
};

export const profile = (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const logout = (req: Request, res: Response) => {
 try {
  const { refreshToken: bodyRefreshToken } = req.body as { refreshToken?: string };

  const refreshToken = bodyRefreshToken ?? req.cookies?.refreshToken;
  if (refreshToken) revokeRefreshToken(refreshToken);

  res.clearCookie("token", { httpOnly: true, secure: COOKIE_OPTIONS.secure, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: COOKIE_OPTIONS.secure, sameSite: "lax" });
  res.status(200).json({ message: "Logged out successfully" });
  
 } catch (error) {
  res.status(500).json({ message: "Error occurred while logging out", error });
 }
};
