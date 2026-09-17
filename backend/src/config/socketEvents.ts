import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Meeting from "../models/meeting.model.js";
import { saveMessage } from "../controllers/user/message.controller.js";
import { generateInterviewReport } from "../services/reportGeneration.service.js";

export const onlineUsers = new Map();

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

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
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
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.data.user?.email);
    socket.join(`user:${socket.data.user._id.toString()}`);

    socket.on("request-join", async ({ meetingCode }: { meetingCode: string }, acknowledge: (response: { ok: boolean; message?: string }) => void) => {
      try {
        const normalizedCode = String(meetingCode || "").trim().toUpperCase();
        const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
        if (!meeting) return acknowledge({ ok: false, message: "Meeting not found" });
        if (meeting.status === "completed" || meeting.status === "cancelled") return acknowledge({ ok: false, message: "This meeting has ended" });

        const userId = socket.data.user._id;
        const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === userId.toString());
        if (isParticipant) return acknowledge({ ok: true, message: "Already approved" });

        const existingRequest = meeting.joinRequests.find((request) => request.userId.toString() === userId.toString());
        if (existingRequest) {
          if (existingRequest.status === "approved") return acknowledge({ ok: true, message: "Already approved" });
          if (existingRequest.status === "pending") return acknowledge({ ok: true, message: "Request already pending" });
          return acknowledge({ ok: false, message: "Join request was rejected" });
        }

        meeting.joinRequests.push({ userId, status: "pending", requestedAt: new Date() });
        await meeting.save();
        io.to(`user:${meeting.hostId.toString()}`).emit("join-request", {
          meetingCode: normalizedCode,
          requester: { id: userId.toString(), name: socket.data.user.name, email: socket.data.user.email },
        });
        acknowledge({ ok: true, message: "Join request sent" });
      } catch (error) {
        console.error("Socket request-join error:", error);
        acknowledge({ ok: false, message: "Unable to request access" });
      }
    });

    socket.on("respond-to-join", async ({ meetingCode, requesterId, decision }: { meetingCode: string; requesterId: string; decision: "allow" | "reject" }) => {
      try {
        const normalizedCode = String(meetingCode || "").trim().toUpperCase();
        const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
        if (!meeting || meeting.hostId.toString() !== socket.data.user._id.toString()) return;

        const request = meeting.joinRequests.find((item) => item.userId.toString() === requesterId && item.status === "pending");
        if (!request) return;
        request.status = decision === "allow" ? "approved" : "rejected";
        if (decision === "allow") meeting.participants.push({ userId: request.userId, role: "participant" });
        await meeting.save();
        io.to(`user:${requesterId}`).emit("join-request-decision", { meetingCode: normalizedCode, approved: decision === "allow" });
      } catch (error) {
        console.error("Socket respond-to-join error:", error);
      }
    });

    socket.on("join-meeting", async (meetingCode: string) => {
      try {
        const normalizedCode = String(meetingCode).trim().toUpperCase();
        const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
        const isParticipant = meeting?.participants.some((participant) => participant.userId.toString() === socket.data.user._id.toString());
        if (!meeting || !isParticipant) {
          socket.emit("meeting-access-denied", { message: "Join request not approved" });
          return;
        }

        socket.join(normalizedCode);
        console.log(`${socket.data.user.email} joined room: ${normalizedCode}`);
        socket.data.meetingCode = normalizedCode;
        socket.data.isHost =
          meeting?.hostId.toString() === socket.data.user._id.toString();
        socket.data.meetingId = meeting?._id?.toString();
        socket.to(normalizedCode).emit("user-joined", { socketId: socket.id, email: socket.data.user.email });
      } catch (error) { console.error("Failed to resolve meeting for socket:", error); }
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
          (participant: { userId: { toString: () => string } }) =>
            participant.userId.toString() === socket.data.user._id.toString()
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

        io.to(meetingCode).emit("receive-message", {
          _id: savedMessage._id,
          message: savedMessage.content,
          sender: socket.data.user.name || socket.data.user.email,
          senderId: socket.data.user._id,
          timestamp: savedMessage.createdAt,
        });
      } catch (error) {
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

    socket.on("code-change", ({ meetingCode, code }) => {
      socket.to(meetingCode).emit("code-change", { code });
    });

    socket.on("question-generated", ({ meetingCode, question }) => {
      socket.to(meetingCode).emit("question-generated", { question });
    });

    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);

      const { meetingCode, meetingId, isHost } = socket.data;
      if (!meetingCode || !meetingId) return;

      // Only the host leaving ends the meeting and triggers report generation.
      if (isHost) {
        try {
          await Meeting.findByIdAndUpdate(meetingId, {
            status: "completed",
            closedAt: new Date(),
          });

          io.to(meetingCode).emit("meeting-ended");

          const report = await generateInterviewReport(meetingId);
          console.log("Interview report generated for meeting:", meetingId, report._id);
        } catch (error) {
          console.error("Failed to end meeting / generate report:", error);
        }
      }
    });
  });

  return io;
};