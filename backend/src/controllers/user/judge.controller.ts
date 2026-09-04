import { Request, Response } from "express";
import { judgeCode } from "../../services/judge0.service.js";

export const judge0 = async (req: Request, res: Response) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language are required" });
    }

    const result = await judgeCode(code, language, input);
    res.status(200).json(result);
  } catch (error) {
    console.error("Judge0 error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};