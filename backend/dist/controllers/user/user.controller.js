"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = void 0;
const user_model_js_1 = __importDefault(require("../../models/user.model.js"));
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const user = await user_model_js_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserProfile = getUserProfile;
