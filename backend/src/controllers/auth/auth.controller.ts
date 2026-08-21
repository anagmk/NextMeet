import { Request, Response, NextFunction } from "express";
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { createRefreshToken, revokeRefreshToken, useRefreshToken } from "../../services/token.service.js";

const COOKIE_OPTIONS: import("express").CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
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
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: 'Name and email cannot be empty' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();
    const refreshToken = createSession(res, user);
    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      refreshToken,
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

