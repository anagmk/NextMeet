"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = exports.onlineUsers = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const meeting_model_js_1 = __importDefault(require("../models/meeting.model.js"));
const message_controller_js_1 = require("../controllers/user/message.controller.js");
exports.onlineUsers = new Map();
function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach((pair) => {
        const index = pair.indexOf("=");
        if (index === -1)
            return;
        const key = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
}
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });
    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            console.log("Raw cookie header:", cookieHeader);
            if (!cookieHeader) {
                return next(new Error("Not authenticated"));
            }
            const cookies = parseCookies(cookieHeader);
            console.log("Parsed cookies:", Object.keys(cookies));
            const token = cookies.token;
            if (!token) {
                return next(new Error("Token not found in cookies"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await user_model_js_1.default.findById(decoded.id).select("-password");
            if (!user) {
                return next(new Error("User no longer exists"));
            }
            if (user.isBlocked) {
                return next(new Error("Account has been blocked"));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
            console.error("Socket auth error:", error);
            next(new Error("Invalid or expired token"));
        }
    });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id, "user:", socket.data.user?.email);
        socket.on("join-meeting", (meetingCode) => {
            socket.join(meetingCode);
            console.log(`${socket.data.user.email} joined room: ${meetingCode}`);
            socket.to(meetingCode).emit("user-joined", {
                socketId: socket.id,
                email: socket.data.user.email,
            });
        });
        socket.on("send-message", async ({ meetingCode, message }) => {
            const trimmedMessage = String(message || "").trim();
            if (!meetingCode || !trimmedMessage) {
                return;
            }
            try {
                const meeting = await meeting_model_js_1.default.findOne({ meetingCode: String(meetingCode).trim().toUpperCase() });
                if (!meeting) {
                    return;
                }
                const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === socket.data.user._id.toString());
                if (!isParticipant) {
                    return;
                }
                const savedMessage = await (0, message_controller_js_1.saveMessage)(meeting._id.toString(), socket.data.user._id.toString(), trimmedMessage, "text");
                io.to(meetingCode).emit("receive-message", {
                    _id: savedMessage._id,
                    message: savedMessage.content,
                    sender: socket.data.user.name || socket.data.user.email,
                    senderId: socket.data.user._id,
                    timestamp: savedMessage.createdAt,
                });
            }
            catch (error) {
                console.error("Socket send-message error:", error);
            }
        });
        socket.on("webrtc-offer", ({ offer, to }) => {
            io.to(to).emit("webrtc-offer", { offer, from: socket.id });
        });
        socket.on("webrtc-answer", ({ answer, to }) => {
            io.to(to).emit("webrtc-answer", { answer, from: socket.id });
        });
        socket.on("webrtc-ice-candidate", ({ candidate, to }) => {
            io.to(to).emit("webrtc-ice-candidate", { candidate, from: socket.id });
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
