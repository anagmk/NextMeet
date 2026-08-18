import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";
import Meeting from "./models/meeting.model.js";
import { saveMessage } from "./controllers/user/message.controller.js";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair) => {
    const index = pair.indexOf("=");
    if (index === -1) return;
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User no longer exists"));
    }
    if (user.isBlocked) {
      return next(new Error("Account has been blocked"));
    }

    socket.data.user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.data.user?.email);

  socket.on("join-meeting", (meetingCode: string) => {
    socket.join(meetingCode);
    console.log(`${socket.data.user.email} joined room: ${meetingCode}`);

    // let others in the room know someone joined
    socket.to(meetingCode).emit("user-joined", {
      socketId: socket.id,
      email: socket.data.user.email,
    });
  });

  socket.on("send-message", async ({ meetingCode, message }: { meetingCode: string; message: string }) => {
    const trimmedMessage = String(message || "").trim();

    if (!meetingCode || !trimmedMessage) {
      return;
    }

    try {
      const meeting = await Meeting.findOne({ meetingCode: String(meetingCode).trim().toUpperCase() });
      if (!meeting) {
        return;
      }

      const isParticipant = meeting.participants.some(
        (participant: { userId: { toString: () => string } }) => participant.userId.toString() === socket.data.user._id.toString()
      );

      if (!isParticipant) {
        return;
      }

      const savedMessage = await saveMessage(
        meeting._id.toString(),
        socket.data.user._id.toString(),
        trimmedMessage,
        "text"
      );

      const payload = {
        _id: savedMessage._id,
        message: savedMessage.content,
        sender: socket.data.user.name || socket.data.user.email,
        senderId: socket.data.user._id,
        timestamp: savedMessage.createdAt,
      };

      io.to(meetingCode).emit("receive-message", payload);
    } catch (error) {
      console.error("Socket send-message error:", error);
    }
  });

    socket.on("webrtc-offer", ({ meetingCode, offer, to }) => {
    io.to(to).emit("webrtc-offer", { offer, from: socket.id });
  });

  socket.on("webrtc-answer", ({ meetingCode, answer, to }) => {
    io.to(to).emit("webrtc-answer", { answer, from: socket.id });
  });

  socket.on("webrtc-ice-candidate", ({ meetingCode, candidate, to }) => {
    io.to(to).emit("webrtc-ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});