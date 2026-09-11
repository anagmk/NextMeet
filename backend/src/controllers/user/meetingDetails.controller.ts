// controllers/user/meetingDetails.controller.ts
import { Request, Response } from "express";
import Meeting from "../../models/meeting.model.js";

export const getMeetingDetails = async (req: Request, res: Response) => {
  try {
    const { meetingCode } = req.params;
    const userId = (req.user as { _id?: string } | undefined)?._id;

    const meeting = await Meeting.findOne({
      meetingCode: String(meetingCode).trim().toUpperCase(),
    }).populate("hostId", "name email profileImage")
      .populate("participants.userId", "name email profileImage");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const isParticipant = meeting.participants.some(
      (p: any) => p.userId._id.toString() === userId?.toString(),
    );
    const isHost = meeting.hostId._id.toString() === userId?.toString();

    if (!isParticipant && !isHost) {
      return res.status(403).json({ message: "You were not part of this meeting" });
    }

    res.status(200).json({
      meeting: {
        title: meeting.title,
        description: meeting.description,
        meetingCode: meeting.meetingCode,
        scheduledAt: meeting.scheduledAt,
        duration: meeting.duration,
        status: meeting.status,
        closedAt: meeting.closedAt,
        host: meeting.hostId,
        participants: meeting.participants,
      },
      isHost,
    });
  } catch (error) {
    console.error("Get meeting details error:", error);
    res.status(500).json({ message: "Failed to fetch meeting details" });
  }
};