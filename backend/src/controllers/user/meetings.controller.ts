import { Request, Response } from "express";
import Meeting from "../../models/meeting.model.js";
import { generateInterviewReport } from "../../services/reportGeneration.service.js";

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

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;
    const search = String(req.query.search ?? "").trim();
    const status = String(req.query.status ?? "all").trim().toLowerCase();

    const filter: any = { "participants.userId": userId };
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { meetingCode: { $regex: search, $options: "i" } },
      ];
    }

    const [meetings, total] = await Promise.all([
      Meeting.find(filter)
        .populate("hostId", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Meeting.countDocuments(filter),
    ]);

    return res.status(200).json({
      meetings,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return res.status(500).json({ message: "Error fetching meetings", error });
  }
};

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const meetingId = String(req.params.id);
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
    if (!isParticipant) return res.status(403).json({ message: "Join request not approved" });

    res.status(200).json({ message: "Join permission confirmed", meeting });
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

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const meetingId = String(req.params.id || "").trim();
    const userId = (req.user as { _id?: string } | undefined)?._id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!meetingId) return res.status(400).json({ message: "Meeting ID is required" });

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can delete this meeting" });
    }

    await Meeting.findByIdAndDelete(meetingId);

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Delete meeting error:", error);
    res.status(500).json({ message: "Error deleting meeting" });
  }
};

export const closeMeeting = async (req: Request, res: Response) => {
  try {
    const meetingId = String(req.params.id);
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
    if (!updatedMeeting) return res.status(404).json({ message: "Meeting not found" });

    const report = await generateInterviewReport(meetingId);

    res.status(200).json({ 
      message: "Meeting closed successfully",
      meeting: updatedMeeting,
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Error closing meeting", error });
  }
};

export const meetingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;
    const search = String(req.query.search ?? "").trim();
    const status = String(req.query.status ?? "all").trim().toLowerCase();

    const filter: any = {
      "participants.userId": userId,
      status: { $in: ["completed", "cancelled", "active"] },
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { meetingCode: { $regex: search, $options: "i" } },
      ];
    }

    const [meetings, total] = await Promise.all([
      Meeting.find(filter)
        .populate("hostId", "name email")
        .populate("participants.userId", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Meeting.countDocuments(filter),
    ]);

    const serializedMeetings = meetings.map((meeting) => {
      const hostRecord = meeting.hostId as any;

      return {
        _id: meeting._id,
        title: meeting.title,
        description: meeting.description,
        meetingCode: meeting.meetingCode,
        scheduledAt: meeting.scheduledAt,
        closedAt: meeting.closedAt,
        duration: meeting.duration,
        status: meeting.status,
        host: hostRecord
          ? {
              _id: hostRecord._id ?? hostRecord.toString(),
              name: hostRecord.name ?? "Unknown host",
              email: hostRecord.email ?? "",
            }
          : null,
        isHost: meeting.hostId?.toString() === userId.toString(),
        participantCount: meeting.participants?.length ?? 0,
      };
    });

    return res.status(200).json({
      meetings: serializedMeetings,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Meeting history error:", error);
    return res.status(500).json({ message: "Error fetching meeting history", error });
  }
};

