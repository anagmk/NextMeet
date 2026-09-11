import { Request, Response } from "express";
import { judgeCode } from "../../services/judge0.service.js";
import MeetingInterview from "../../models/meetingInterview.model.js";
import { buildExecutableCode } from "../../utils/buildExecutableCode.js";

const normalizeOutput = (value: string) =>
  value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").trim();

export const judge0 = async (req: Request, res: Response) => {
  try {
    const { code, language, input, questionId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language are required" });
    }

    if (questionId) {
      const question = await MeetingInterview.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const testCases = question.testCases.slice(0, 2);
      if (testCases.length === 0) {
        return res.status(422).json({ message: "Question has no test cases" });
      }

      const results = await Promise.all(
        testCases.map(async (testCase, index) => {
          try {
            const executableCode = buildExecutableCode(
              code,
              question.functionName,
              testCase.args,
              language,
            );
            const result = await judgeCode(executableCode, language);
            const actual = result.run.stdout ?? "";
            const executionError = (result.run.stderr ?? "").trim();
            const passed =
              Number(result.run.code) === 0 &&
              normalizeOutput(actual) === normalizeOutput(testCase.expectedOutput);

            return {
              label: `Test ${index + 1}`,
              passed,
              hidden: testCase.isHidden,
              args: testCase.args,
              expected: testCase.expectedOutput,
              actual: actual || executionError,
              executionError:
                Number(result.run.code) !== 0
                  ? executionError || "The program exited with an error."
                  : undefined,
            };
          } catch (error) {
            return {
              label: `Test ${index + 1}`,
              passed: false,
              hidden: testCase.isHidden,
              args: testCase.args,
              expected: testCase.expectedOutput,
              actual: "",
              executionError: error instanceof Error ? error.message : "Failed to run test case.",
            };
          }
        }),
      );

      return res.status(200).json({ results });
    }

    const result = await judgeCode(code, language, input);
    res.status(200).json(result);
  } catch (error) {
    console.error("Judge0 error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};