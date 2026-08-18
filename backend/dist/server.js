"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_js_1 = __importDefault(require("./app.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_js_1 = __importDefault(require("./models/user.model.js"));
const meeting_model_js_1 = __importDefault(require("./models/meeting.model.js"));
const message_controller_js_1 = require("./controllers/user/message.controller.js");
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app_js_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
    transports: ["websocket", "polling"],
});
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
    catch (err) {
        console.error("Socket auth error:", err);
        next(new Error("Invalid or expired token"));
    }
});
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.data.user?.email);
    socket.on("join-meeting", (meetingCode) => {
        socket.join(meetingCode);
        console.log(`${socket.data.user.email} joined room: ${meetingCode}`);
        // let others in the room know someone joined
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
            const payload = {
                _id: savedMessage._id,
                message: savedMessage.content,
                sender: socket.data.user.name || socket.data.user.email,
                senderId: socket.data.user._id,
                timestamp: savedMessage.createdAt,
            };
            io.to(meetingCode).emit("receive-message", payload);
        }
        catch (error) {
            console.error("Socket send-message error:", error);
        }
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
