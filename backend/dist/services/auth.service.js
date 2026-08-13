"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
async function findOrCreateGoogleUser(profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
        throw new Error("Google account has no email");
    }
    let user = await user_model_js_1.default.findOne({ googleId: profile.id });
    if (user)
        return user;
    user = await user_model_js_1.default.findOne({ email });
    if (user) {
        user.googleId = profile.id;
        if (!user.authProvider || user.authProvider === "local") {
            user.authProvider = "google";
        }
        await user.save();
        return user;
    }
    user = await user_model_js_1.default.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        profileImage: profile.photos?.[0]?.value,
        authProvider: "google",
    });
    return user;
}
exports.default = {
    findOrCreateGoogleUser,
};
