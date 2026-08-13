"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.googleAuthCallback = exports.logout = exports.refresh = exports.login = exports.signup = void 0;
const user_model_js_1 = __importDefault(require("../../models/user.model.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_service_js_1 = require("../../services/token.service.js");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
};
const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 7) * 24 * 60 * 60 * 1000,
};
function createAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m" });
}
function createSession(res, user) {
    const accessToken = createAccessToken(user);
    const refreshToken = (0, token_service_js_1.createRefreshToken)(String(user._id));
    res.cookie("token", accessToken, COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return refreshToken;
}
const signup = async (req, res, next) => {
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
        const userExists = await user_model_js_1.default.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(409).json({ message: 'An account with this email already exists. Please log in instead.' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_js_1.default({
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
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const userExist = await user_model_js_1.default.findOne({ email });
        if (!userExist) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, userExist.password);
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken: bodyRefreshToken } = req.body;
        const refreshToken = bodyRefreshToken ?? req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }
        const userId = (0, token_service_js_1.useRefreshToken)(refreshToken);
        if (!userId) {
            return res.status(401).json({ message: "Your session has expired. Please log in again." });
        }
        const user = await user_model_js_1.default.findById(userId);
        if (!user || user.isBlocked) {
            return res.status(401).json({ message: "Your session is no longer valid. Please log in again." });
        }
        const nextRefreshToken = createSession(res, user);
        res.status(200).json({ message: "Session refreshed", refreshToken: nextRefreshToken });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = (req, res) => {
    const { refreshToken: bodyRefreshToken } = req.body;
    const refreshToken = bodyRefreshToken ?? req.cookies?.refreshToken;
    if (refreshToken)
        (0, token_service_js_1.revokeRefreshToken)(refreshToken);
    res.clearCookie("token", { httpOnly: true, secure: COOKIE_OPTIONS.secure, sameSite: "lax" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: COOKIE_OPTIONS.secure, sameSite: "lax" });
    res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
const googleAuthCallback = (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Google authentication failed" });
        createSession(res, user);
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
    catch (error) {
        res.status(500).json({ message: 'Error during Google authentication', error });
    }
};
exports.googleAuthCallback = googleAuthCallback;
const profile = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};
exports.profile = profile;
