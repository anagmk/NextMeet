"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingHistory = exports.closeMeeting = exports.leaveMeeting = exports.joinMeeting = exports.getMeetingByCode = exports.getMeetingById = exports.getMeetings = exports.createMeeting = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const meeting_model_js_1 = __importDefault(require("../../models/meeting.model.js"));
const generateUniqueMeetingCode = async () => {
    let code;
    let exists = true;
    do {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        exists = !!(await meeting_model_js_1.default.exists({ meetingCode: code }));
    } while (exists);
    return code;
};
const createMeeting = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const { title, description, scheduledAt, duration } = req.body;
        const meetingTitle = title?.trim();
        if (!meetingTitle)
            return res.status(400).json({ message: "Meeting title is required" });
        if (!scheduledAt)
            return res.status(400).json({ message: "Scheduled time is required" });
        if (!duration || duration <= 0)
            return res.status(400).json({ message: "Duration must be a positive number" });
        const meetingCode = await generateUniqueMeetingCode();
        const newMeeting = new meeting_model_js_1.default({
            title: meetingTitle,
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
const getMeetings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meetings = await meeting_model_js_1.default.find({ "participants.userId": userId });
        // `find` returns an array; return empty array when none found instead of 404
        if (!meetings || meetings.length === 0)
            return res.status(200).json([]);
        res.status(200).json(meetings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching meetings", error });
    }
};
exports.getMeetings = getMeetings;
const getMeetingById = async (req, res) => {
    try {
        const meetingId = req.params.id;
        if (!meetingId)
            return res.status(400).json({ message: "Meeting ID is required" });
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meeting = await meeting_model_js_1.default.findOne({ _id: meetingId, "participants.userId": userId });
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });
        res.status(200).json(meeting);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching meeting", error });
    }
};
exports.getMeetingById = getMeetingById;
const getMeetingByCode = async (req, res) => {
    try {
        const { meetingCode } = req.params;
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const normalizedCode = String(meetingCode ?? "").trim().toUpperCase();
        const meeting = await meeting_model_js_1.default.findOne({ meetingCode: normalizedCode })
            .populate("hostId", "name email");
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });
        if (meeting.status === "completed") {
            return res.status(410).json({ message: "This meeting has ended" });
        }
        res.status(200).json(meeting);
    }
    catch (error) {
        console.error("getMeetingByCode error:", error);
        res.status(500).json({ message: "Error fetching meeting", error });
    }
};
exports.getMeetingByCode = getMeetingByCode;
const joinMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.body || {};
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        if (!meetingCode)
            return res.status(400).json({ message: "Meeting code is required" });
        const normalizedCode = String(meetingCode ?? "").trim().toUpperCase();
        const meeting = await meeting_model_js_1.default.findOne({ meetingCode: normalizedCode });
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });
        const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === userId.toString());
        if (isParticipant)
            return res.status(400).json({ message: "User already joined the meeting" });
        meeting.participants.push({ userId: new mongoose_1.default.Types.ObjectId(userId), role: "participant" });
        await meeting.save();
        res.status(200).json({ message: "Joined the meeting successfully", meeting });
    }
    catch (error) {
        res.status(500).json({ message: "Error joining meeting", error });
    }
};
exports.joinMeeting = joinMeeting;
const leaveMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meeting = await meeting_model_js_1.default.findById(meetingId);
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });
        const participantIndex = meeting.participants.findIndex(participant => participant.userId.toString() === userId.toString());
        if (participantIndex === -1)
            return res.status(400).json({ message: "User is not a participant of the meeting" });
        meeting.participants.splice(participantIndex, 1);
        await meeting.save();
        res.status(200).json({ message: "Left the meeting successfully", meeting });
    }
    catch (error) {
        res.status(500).json({ message: "Error leaving meeting", error });
    }
};
exports.leaveMeeting = leaveMeeting;
const closeMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meeting = await meeting_model_js_1.default.findById(meetingId);
        if (!meeting)
            return res.status(404).json({ message: "Meeting not found" });
        if (meeting.hostId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the host can close the meeting" });
        }
        const updatedMeeting = await meeting_model_js_1.default.findByIdAndUpdate(meetingId, { status: "completed", closedAt: new Date() }, { new: true });
        res.status(200).json({
            message: "Meeting closed successfully",
            meeting: updatedMeeting
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error closing meeting", error });
    }
};
exports.closeMeeting = closeMeeting;
const meetingHistory = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const meetings = await meeting_model_js_1.default.find({ "participants.userId": userId, status: "completed" });
        if (!meetings || meetings.length === 0)
            return res.status(200).json([]);
        res.status(200).json(meetings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching meeting history", error });
    }
};
exports.meetingHistory = meetingHistory;
