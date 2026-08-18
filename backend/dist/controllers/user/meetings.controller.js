"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeeting = void 0;
const meeting_model_js_1 = __importDefault(require("../../models/meeting.model.js"));
const createMeeting = async (req, res) => {
    try {
        const { title, description, scheduledAt, duration } = req.body;
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newMeeting = new meeting_model_js_1.default({
            title,
            description,
            scheduledAt,
            duration,
            hostId: userId,
            meetingCode,
            participants: [{ userId, role: "host" }],
        });
        const savedMeeting = await newMeeting.save();
        res.status(201).json(savedMeeting);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating meeting", error });
    }
};
exports.createMeeting = createMeeting;
