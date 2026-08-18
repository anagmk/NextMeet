"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const meeting_model_js_1 = __importDefault(require("../../models/meeting.model.js"));
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meetings = await meeting_model_js_1.default.find({ hostId: userId }).sort({ scheduledAt: 1 });
        res.status(200).json({ meetings });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};
exports.getDashboardData = getDashboardData;
