import { Request, Response } from "express";
import { Types } from "mongoose";
import { generateInterviewQuestion } from "../../services/gemini.service.js";
import Meeting from "../../models/meeting.model.js";
import MeetingInterview from "../../models/meetingInterview.model.js";
import { judgeCode } from "../../services/judge0.service.js";
import { getStarterCode } from "../../services/starterCode.service.js";
import { buildExecutableCode } from "../../utils/buildExecutableCode.js";
import InterviewSubmission from "../../models/interviewSubmission.model.js";

const TEST_CASE_COUNT = 2;

// Treat CRLF/LF and trailing whitespace as equivalent, while preserving the
// actual value returned to the UI for debugging.
const normalizeOutput = (value: string) =>
  value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").trim();

export const generateQuestion = async (req: Request, res: Response) => {
  try {
    const { meetingCode, level, domain, language, jobRole, description } = req.body;

    if (!meetingCode || !level || !domain || !language || !jobRole) {
      return res.status(400).json({
        message: "meetingCode, level, domain, language, and jobRole are required",
      });
    }

    const meeting = await Meeting.findOne({
      meetingCode: String(meetingCode).trim().toUpperCase(),
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId || meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can generate questions" });
    }

    const question = await generateInterviewQuestion({
      level,
      domain,
      language,
      jobRole,
      description,
    });

    // Use Gemini's own starterCode as-is — it already matches question.functionName.
    const savedQuestion = await MeetingInterview.create({
      meetingId: meeting._id,
      generatedBy: userId,
      ...question,
      language,
    });

    res.status(200).json({
      ...question,
      starterCode: savedQuestion.starterCode,
      language,
      functionName: savedQuestion.functionName,
      questionId: savedQuestion._id,
    });
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ message: "Failed to generate question" });
  }
};

export const createManualQuestion = async (req: Request, res: Response) => {
  try {
    const { meetingCode, title, description, language, testCases } = req.body;
    if (!meetingCode || !title?.trim() || !description?.trim() || !language) {
      return res.status(400).json({ message: "title, description, and language are required" });
    }
    if (!Array.isArray(testCases) || testCases.length !== TEST_CASE_COUNT) {
      return res.status(400).json({ message: "Exactly two test cases are required" });
    }

    const normalizedTestCases = testCases.map((testCase) => {
      if (typeof testCase?.input !== "string" || typeof testCase.expectedOutput !== "string") {
        throw new Error("Each test case needs an input and expected output");
      }
      return { args: [testCase.input], expectedOutput: testCase.expectedOutput, isHidden: false };
    });

    const meeting = await Meeting.findOne({ meetingCode: String(meetingCode).trim().toUpperCase() });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId || meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can create questions" });
    }

    const functionName = "solution";
    const question = await MeetingInterview.create({
      meetingId: meeting._id,
      generatedBy: userId,
      title: title.trim(),
      description: description.trim(),
      starterCode: getStarterCode(language, functionName, ["input"]),
      functionName,
      language,
      testCases: normalizedTestCases,
    });

    return res.status(201).json({
      questionId: question._id,
      title: question.title,
      description: question.description,
      starterCode: question.starterCode,
      language: question.language,
      functionName: question.functionName,
      testCases: question.testCases,
    });
  } catch (error) {
    console.error("Manual question creation error:", error);
    return res.status(400).json({ message: "Failed to create manual question" });
  }
};

export const submitQuestionAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { code, language, confirmSubmit } = req.body;
    const userId = (req.user as { _id?: string } | undefined)?._id;
    const submittedCode = typeof code === "string" ? code : "";

    if (!userId || !submittedCode.trim() || !language) {
      return res.status(400).json({ message: "code and language are required" });
    }

    const question = await MeetingInterview.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const meeting = await Meeting.findById(question.meetingId);
    const isParticipant = meeting?.participants.some(
      (participant) => participant.userId.toString() === userId.toString(),
    );
    if (!meeting || !isParticipant) {
      return res.status(403).json({ message: "You are not a participant of this meeting" });
    }

    const testCases = question.testCases.slice(0, TEST_CASE_COUNT);
    if (testCases.length !== TEST_CASE_COUNT) {
      return res.status(422).json({ message: "This question does not have two valid test cases" });
    }

    const results = await Promise.all(
      testCases.map(async (testCase, index) => {
        let executableCode: string;
        try {
          executableCode = buildExecutableCode(submittedCode, question.functionName, testCase.args, language);
        } catch (err) {
          return {
            label: `Test ${index + 1}`,
            passed: false,
            executionError: err instanceof Error ? err.message : "Unsupported language",
            hidden: testCase.isHidden,
            args: testCase.args,
            expected: testCase.expectedOutput,
            actual: "",
          };
        }

        const result = await judgeCode(executableCode, language);
        const actual = result.run.stdout ?? "";
        const expected = testCase.expectedOutput;
        const executionError = (result.run.stderr ?? "").trim();
        const exitCode = Number(result.run.code);

        return {
          label: `Test ${index + 1}`,
          passed: exitCode === 0 && normalizeOutput(actual) === normalizeOutput(expected),
          executionError: exitCode !== 0 ? executionError || "The program exited with an error." : undefined,
          hidden: testCase.isHidden,
          args: testCase.args,
          expected,
          actual: actual || executionError,
        };
      }),
    );

    const allPassed = results.every((result) => result.passed);

    if (!allPassed && confirmSubmit === false) {
      return res.status(200).json({
        saved: false,
        requiresConfirmation: true,
        results,
      });
    }

    await InterviewSubmission.create({
      meetingId: meeting._id,
      questionId: question._id,
      candidateId: new Types.ObjectId(userId),
      hostId: meeting.hostId,
      question: {
        title: question.title,
        description: question.description,
        testCases: question.testCases.map((testCase) => ({
          input: testCase.args.join(", "),
          expectedOutput: testCase.expectedOutput,
          isHidden: testCase.isHidden,
        })),
      },
      language,
      code: submittedCode,
      testResults: results.map((result) => ({
        input: result.args.join(", "),
        expectedOutput: result.expected,
        actualOutput: result.actual,
        passed: result.passed,
        isHidden: result.hidden,
      })),
      solved: allPassed,
    });

    const existingAnswer = question.answers.some(
      (answer) => answer.submittedBy.toString() === userId.toString(),
    );
    if (!existingAnswer) {
      question.answers.push({
        submittedBy: new Types.ObjectId(userId),
        code: submittedCode,
        language,
        submittedAt: new Date(),
      });
      await question.save();
    }

    return res.status(200).json({ saved: true, results });
  } catch (error) {
    console.error("Question submission error:", error);
    return res.status(500).json({ message: "Failed to submit answer" });
  }
};
