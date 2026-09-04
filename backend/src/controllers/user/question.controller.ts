import { Request, Response } from "express";
import { generateInterviewQuestion } from "../../services/gemini.service.js";

export const generateQuestion = async (req: Request, res: Response) => {
  try {
    const { level, domain, language, jobRole, description } = req.body;

    if (!level || !domain || !language || !jobRole) {
      return res.status(400).json({
        message: "level, domain, language, and jobRole are required",
      });
    }

    const question = await generateInterviewQuestion({
      level,
      domain,
      language,
      jobRole,
      description,
    });

    res.status(200).json(question);
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ message: "Failed to generate question" });
  }
};