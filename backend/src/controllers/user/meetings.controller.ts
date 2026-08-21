import { Request, Response } from "express";
import mongoose from "mongoose";
import Meeting from "../../models/meeting.model.js";

const generateUniqueMeetingCode = async (): Promise<string> => {
  let code: string;
  let exists = true;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = !!(await Meeting.exists({ meetingCode: code }));
  } while (exists);

  return code;
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if(!userId) return res.status(401).json({ message: "Not authenticated" });

    const { title, description, scheduledAt, duration } = req.body;
    
    const meetingTitle = title?.trim();
    if (!meetingTitle) return res.status(400).json({ message: "Meeting title is required" });
    if (!scheduledAt) return res.status(400).json({ message: "Scheduled time is required" });
    if (!duration || duration <= 0) return res.status(400).json({ message: "Duration must be a positive number" });

    const meetingCode = await generateUniqueMeetingCode();

    const newMeeting = new Meeting({
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
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting", error });
  }
}

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const meetings = await Meeting.find({ "participants.userId": userId })
      .populate("hostId", "name email")
      .sort({ scheduledAt: -1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meetings", error });
  }
};

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.id;
    if(!meetingId) return res.status(400).json({ message: "Meeting ID is required" });
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const meeting = await Meeting.findOne({ _id: meetingId, "participants.userId": userId });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meeting", error });
  }
};

export const getMeetingByCode = async (req: Request, res: Response) => {
  try {
    const { meetingCode } = req.params;
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const normalizedCode = String(meetingCode ?? "").trim().toUpperCase();
    const meeting = await Meeting.findOne({ meetingCode: normalizedCode })
      .populate("hostId", "name email");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (meeting.status === "completed") {
      return res.status(410).json({ message: "This meeting has ended" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    console.error("getMeetingByCode error:", error);
    res.status(500).json({ message: "Error fetching meeting", error });
  }
};

export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingCode } = req.body || {};
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!meetingCode) return res.status(400).json({ message: "Meeting code is required" });

    const normalizedCode = String(meetingCode ?? "").trim().toUpperCase();
    const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const isParticipant = meeting.participants.some((participant) => participant.userId.toString() === userId.toString());
    if (isParticipant) return res.status(400).json({ message: "User already joined the meeting" });

    meeting.participants.push({ userId: new mongoose.Types.ObjectId(userId), role: "participant" });
    await meeting.save();

    res.status(200).json({ message: "Joined the meeting successfully", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error joining meeting", error });
  }
}

export const leaveMeeting = async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.id;
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const participantIndex = meeting.participants.findIndex(participant => participant.userId.toString() === userId.toString());
    if (participantIndex === -1) return res.status(400).json({ message: "User is not a participant of the meeting" });

    meeting.participants.splice(participantIndex, 1);
    await meeting.save();

    res.status(200).json({ message: "Left the meeting successfully", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error leaving meeting", error });
  }
};

export const closeMeeting = async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.id;
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can close the meeting" });
    }


    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "completed", closedAt: new Date() },
      { new: true }
    );

    res.status(200).json({ 
      message: "Meeting closed successfully",
      meeting: updatedMeeting
    });
  } catch (error) {
    res.status(500).json({ message: "Error closing meeting", error });
  }
};

export const meetingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const meetings = await Meeting.find({ "participants.userId": userId, status: { $in: ["completed", "cancelled", "active"] }}).sort({ scheduledAt: -1 });
   
    if (!meetings || meetings.length === 0) return res.status(200).json([]);
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meeting history", error });
  }
};

