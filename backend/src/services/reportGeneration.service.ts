// services/reportGeneration.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import Meeting from "../models/meeting.model.js";
import MeetingInterview from "../models/meetingInterview.model.js";
import InterviewReport from "../models/interviewReport.model.js";
import InterviewSubmission from "../models/interviewSubmission.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function generateInterviewReport(meetingId: string) {
  const meeting = await Meeting.findById(meetingId).populate(
    "participants.userId",
    "name email",
  );
  if (!meeting) throw new Error("Meeting not found");

  const questions = await MeetingInterview.find({ meetingId });
  const submissions = await InterviewSubmission.find({ meetingId }).sort({ submittedAt: -1 });

  const participants = (meeting.participants ?? []).map((p: any) => ({
    userId: p.userId?._id ?? p.userId,
    name: p.userId?.name ?? "Unknown",
    email: p.userId?.email ?? "",
    role: p.role,
    joinedAt: p.joinedAt,
    leftAt: p.leftAt,
  }));

  const candidate = (meeting.participants ?? []).find((p: any) => p.role === "participant") ?? (meeting.participants ?? [])[0];
  const candidateUserId = candidate?.userId ? (candidate.userId._id ?? candidate.userId) : null;

  const questionEvaluations: any[] = [];

  for (const question of questions) {
    const answer = candidateUserId
      ? question.answers.find((item) => item.submittedBy.toString() === candidateUserId.toString())
      : undefined;

    const candidateSubmissions = candidateUserId
      ? submissions.filter((item) => item.candidateId?.toString() === candidateUserId.toString())
      : [];

    const submission =
      candidateSubmissions.find((item) => item.questionId?.toString() === question._id.toString()) ??
      candidateSubmissions.find(
        (item) =>
          item.question?.title === question.title && item.question?.description === question.description,
      ) ??
      null;

    const finalCode = typeof submission?.code === "string" && submission.code.trim()
      ? submission.code
      : typeof answer?.code === "string" && answer.code.trim()
        ? answer.code
        : "";
    const language = submission?.language ?? answer?.language ?? question.language;
    const testResults = Array.isArray(submission?.testResults) ? submission.testResults : [];
    const hasRealSubmission = finalCode.trim().length > 0;
    const solved = Boolean(submission?.solved) || (testResults.length > 0 && testResults.every((result: any) => result.passed));
    const status: "passed" | "failed" | "not_submitted" = hasRealSubmission
      ? solved
        ? "passed"
        : "failed"
      : "not_submitted";

    let evaluation = {
      score: status === "not_submitted" ? 0 : solved ? 100 : Math.max(0, Math.round((testResults.filter((result: any) => result.passed).length / Math.max(testResults.length, 1)) * 100)),
      strengths: [] as string[],
      weaknesses: [] as string[],
      summary: status === "not_submitted"
        ? "The candidate did not submit an answer to this question."
        : solved
          ? "The candidate submitted a correct solution that met the expected criteria."
          : "The candidate submitted an answer, but it did not meet the expected criteria.",
    };

    if (hasRealSubmission) {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
You are evaluating a candidate's performance on a technical interview question.

Question: ${question.title}
${question.description}

Candidate's solution (${language}):
${finalCode}

This solution is marked as: ${status === "passed" ? "passed" : "failed"}.
Respond ONLY with valid JSON in this shape:
{
  "score": 0-100,
  "strengths": ["short bullet points"],
  "weaknesses": ["short bullet points"],
  "summary": "2-3 sentence overall assessment"
}
`.trim();

      try {
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        evaluation = {
          score: Number.isFinite(parsed?.score) ? Math.min(100, Math.max(0, Number(parsed.score))) : evaluation.score,
          strengths: Array.isArray(parsed?.strengths) ? parsed.strengths.filter((item: any) => typeof item === "string") : evaluation.strengths,
          weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses.filter((item: any) => typeof item === "string") : evaluation.weaknesses,
          summary: typeof parsed?.summary === "string" && parsed.summary.trim() ? parsed.summary : evaluation.summary,
        };
      } catch (error) {
        console.error(`AI evaluation failed for question ${question._id}:`, error);
      }
    }

    questionEvaluations.push({
      questionId: question._id,
      title: question.title,
      description: question.description,
      testCases: question.testCases,
      solved: status === "passed",
      status,
      isSubmitted: hasRealSubmission,
      finalCode: hasRealSubmission ? finalCode : undefined,
      language,
      testResults,
      score: evaluation.score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      summary: evaluation.summary,
    });
  }

  const totalQuestions = questionEvaluations.length;
  const questionsPassed = questionEvaluations.filter((question) => question.status === "passed").length;
  const questionsFailed = questionEvaluations.filter((question) => question.status === "failed").length;
  const questionsNotSubmitted = questionEvaluations.filter((question) => question.status === "not_submitted").length;
  const overallResult = totalQuestions === 0 || questionsNotSubmitted > 0 || questionsFailed > 0 ? "failed" : "passed";
  const overallScore = totalQuestions > 0
    ? Math.round(questionEvaluations.reduce((sum, question) => sum + question.score, 0) / totalQuestions)
    : 0;

  const overallSummary =
    totalQuestions === 0
      ? "No questions were attempted during this interview."
      : overallResult === "passed"
        ? `The candidate passed all ${totalQuestions} questions and achieved an overall score of ${overallScore}%.`
        : `The candidate passed ${questionsPassed} question(s), failed ${questionsFailed} question(s), and left ${questionsNotSubmitted} question(s) unsubmitted.`;

  const report = await InterviewReport.findOneAndUpdate(
    { meetingId: meeting._id },
    {
      meetingId: meeting._id,
      hostId: meeting.hostId,
      candidateId: candidateUserId,
      participants,
      questionEvaluations,
      overallResult,
      totalQuestions,
      questionsPassed,
      questionsFailed,
      questionsNotSubmitted,
      overallScore,
      overallSummary,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  return report;
}