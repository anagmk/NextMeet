"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const auth_service_js_1 = __importDefault(require("../services/auth.service.js"));
const callbackURL = process.env.GOOGLE_CALLBACK_URL ?? process.env.GOOGLE_REDIRECT_URI;
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !callbackURL) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.");
}
passport_1.default.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await auth_service_js_1.default.findOrCreateGoogleUser(profile);
        return done(null, user);
    }
    catch (err) {
        return done(err, null);
    }
}));
exports.default = passport_1.default;
