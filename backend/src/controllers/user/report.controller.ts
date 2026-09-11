// controllers/user/report.controller.ts
import { Request, Response } from "express";
import Meeting from "../../models/meeting.model.js";
import InterviewReport from "../../models/interviewReport.model.js";
import Notification from "../../models/notification.model.js";
import { generateInterviewReport } from "../../services/reportGeneration.service.js";

const getMeetingByCode = async (meetingCode: string) => {
  return Meeting.findOne({
    meetingCode: String(meetingCode).trim().toUpperCase(),
  });
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const meetingCode = String(req.params.meetingCode ?? "").trim();
    const userId = (req.user as { _id?: string } | undefined)?._id;

    const meeting = await getMeetingByCode(meetingCode);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const report = await InterviewReport.findOne({ meetingId: meeting._id });
    if (!report) return res.status(404).json({ message: "Report not yet generated" });

    const isHost = userId && meeting.hostId.toString() === userId.toString();
    const isParticipant = userId && meeting.participants.some((participant: any) => participant.userId.toString() === userId.toString());

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "You do not have access to this report" });
    }

    if (!isHost && !report.isPublished) {
      return res.status(403).json({ message: "This report is not published yet" });
    }

    return res.status(200).json({ report, isPublished: report.isPublished, isHost });
  } catch (error) {
    console.error("Get report error:", error);
    return res.status(500).json({ message: "Failed to fetch report" });
  }
};

export const updateReportNotes = async (req: Request, res: Response) => {
  try {
    const meetingCode = String(req.params.meetingCode ?? "").trim();
    const { hostNotes } = req.body;
    const userId = (req.user as { _id?: string } | undefined)?._id;

    const meeting = await getMeetingByCode(meetingCode);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!userId || meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can edit this report" });
    }

    const report = await InterviewReport.findOneAndUpdate(
      { meetingId: meeting._id },
      { hostNotes },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });

    return res.status(200).json({ report });
  } catch (error) {
    console.error("Update report error:", error);
    return res.status(500).json({ message: "Failed to update report" });
  }
};

export const publishReport = async (req: Request, res: Response) => {
  try {
    const meetingCode = String(req.params.meetingCode ?? "").trim();
    const userId = (req.user as { _id?: string } | undefined)?._id;

    const meeting = await getMeetingByCode(meetingCode);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!userId || meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can publish this report" });
    }

    const report = await InterviewReport.findOne({ meetingId: meeting._id });
    if (!report) return res.status(404).json({ message: "Report not yet generated" });

    if (report.isPublished) {
      return res.status(200).json({ report, message: "Report already published" });
    }

    report.isPublished = true;
    report.publishedAt = new Date();
    await report.save();

    const participants = meeting.participants.filter((participant: any) => participant.role === "participant");

    for (const participant of participants) {
      const participantUserId = participant.userId?.toString?.() ?? participant.userId;
      if (!participantUserId) continue;

      await Notification.create({
        recipientId: participantUserId,
        meetingId: meeting._id,
        meetingCode: meeting.meetingCode,
        reportId: report._id,
        type: "report_published",
        message: "Your interview report is now available.",
      });
    }

    return res.status(200).json({ report, message: "Report published successfully" });
  } catch (error) {
    console.error("Publish report error:", error);
    return res.status(500).json({ message: "Failed to publish report" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({ notifications, unreadCount: notifications.filter((notification) => !notification.isRead).length });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
};