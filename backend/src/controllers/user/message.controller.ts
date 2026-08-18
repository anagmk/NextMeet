import { Request, Response } from "express";
import Meeting from "../../models/meeting.model.js";
import Message from "../../models/message.model.js";

export const saveMessage = async (
  meetingId: string,
  senderId: string,
  content: string,
  type: "text" | "system" = "text"
) => {
  const message = new Message({
    meetingId,
    senderId,
    content,
    type,
  });

  return await message.save();
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
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

    const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const isParticipant = meeting.participants.some(
      (participant) => participant.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant of this meeting" });
    }

    const savedMessage = await saveMessage(
      meeting._id.toString(),
      userId,
      messageText,
      "text"
    );

    const populatedMessage = await savedMessage.populate("senderId", "name email");

    return res.status(201).json({
      message: populatedMessage,
      success: true,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Error sending message", error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    const { meetingCode } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const normalizedCode = String(meetingCode || "").trim().toUpperCase();
    if (!normalizedCode) {
      return res.status(400).json({ message: "Meeting code is required" });
    }

    const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const isParticipant = meeting.participants.some(
      (participant) => participant.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant of this meeting" });
    }

    const messages = await Message.find({ meetingId: meeting._id })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ message: "Error fetching messages", error });
  }
};