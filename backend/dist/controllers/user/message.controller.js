"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = exports.saveMessage = void 0;
const meeting_model_js_1 = __importDefault(require("../../models/meeting.model.js"));
const message_model_js_1 = __importDefault(require("../../models/message.model.js"));
const saveMessage = async (meetingId, senderId, content, type = "text") => {
    const message = new message_model_js_1.default({
        meetingId,
        senderId,
        content,
        type,
    });
    return await message.save();
};
exports.saveMessage = saveMessage;
const sendMessage = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { meetingCode } = req.params;
        const { content } = req.body || {};
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const normalizedCode = String(meetingCode || "").trim().toUpperCase();
        const messageText = String(content || "").trim();
        if (!normalizedCode) {
            return res.status(400).json({ message: "Meeting code is required" });
        }
        if (!messageText) {
            return res.status(400).json({ message: "Message content is required" });
        }
        const meeting = await meeting_model_js_1.default.findOne({ meetingCode: normalizedCode });
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }
        const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === userId.toString());
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not a participant of this meeting" });
        }
        const savedMessage = await (0, exports.saveMessage)(meeting._id.toString(), userId, messageText, "text");
        const populatedMessage = await savedMessage.populate("senderId", "name email");
        return res.status(201).json({
            message: populatedMessage,
            success: true,
        });
    }
    catch (error) {
        console.error("sendMessage error:", error);
        return res.status(500).json({ message: "Error sending message", error });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { meetingCode } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const normalizedCode = String(meetingCode || "").trim().toUpperCase();
        if (!normalizedCode) {
            return res.status(400).json({ message: "Meeting code is required" });
        }
        const meeting = await meeting_model_js_1.default.findOne({ meetingCode: normalizedCode });
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }
        const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === userId.toString());
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not a participant of this meeting" });
        }
        const messages = await message_model_js_1.default.find({ meetingId: meeting._id })
            .populate("senderId", "name email")
            .sort({ createdAt: 1 });
        return res.status(200).json(messages);
    }
    catch (error) {
        console.error("getMessages error:", error);
        return res.status(500).json({ message: "Error fetching messages", error });
    }
};
exports.getMessages = getMessages;
