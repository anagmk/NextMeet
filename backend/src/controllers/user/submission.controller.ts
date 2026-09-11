// controllers/user/submission.controller.ts
import { Request, Response } from "express";
import InterviewSubmission from "../../models/interviewSubmission.model.js";
import Meeting from "../../models/meeting.model.js";

export const saveSubmission = async (req: Request, res: Response) => {
  try {
    const { meetingCode, question, language, code, testResults } = req.body;
    const candidateId = (req.user as { _id?: string } | undefined)?._id;

    if (!candidateId) return res.status(401).json({ message: "Not authenticated" });
    if (!meetingCode || !question || !language || !code || !testResults) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const meeting = await Meeting.findOne({
      meetingCode: String(meetingCode).trim().toUpperCase(),
    });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const solved = testResults.every((result: { passed: boolean }) => result.passed);

    const submission = await InterviewSubmission.create({
      meetingId: meeting._id,
      candidateId,
      hostId: meeting.hostId,
      question,
      language,
      code,
      testResults,
      solved,
    });

    res.status(201).json({ message: "Submission saved", submission });
  } catch (error) {
    console.error("Save submission error:", error);
    res.status(500).json({ message: "Failed to save submission" });
  }
};