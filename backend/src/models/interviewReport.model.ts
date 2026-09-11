// models/interviewReport.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

interface IParticipantSummary {
  userId: Types.ObjectId;
  name: string;
  email: string;
  role: "host" | "participant";
  joinedAt?: Date;
  leftAt?: Date;
}

interface IQuestionEvaluation {
  questionId: Types.ObjectId;
  title: string;
  description: string;
  testCases: {
    args: string[];
    expectedOutput: string;
    isHidden: boolean;
  }[];
  solved: boolean;
  status: "passed" | "failed" | "not_submitted";
  isSubmitted: boolean;
  finalCode?: string;
  language?: string;
  testResults: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    isHidden: boolean;
  }[];
  score: number;        // 0-100
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface IInterviewReport extends Document {
  meetingId: Types.ObjectId;
  hostId: Types.ObjectId;
  candidateId?: Types.ObjectId; // primary candidate, if identifiable
  participants: IParticipantSummary[];
  questionEvaluations: IQuestionEvaluation[];
  overallResult: "passed" | "failed";
  totalQuestions: number;
  questionsPassed: number;
  questionsFailed: number;
  questionsNotSubmitted: number;
  overallScore: number;
  overallSummary: string;
  hostNotes: string;      // editable by host, free text added on top of AI evaluation
  isPublished: boolean;
  publishedAt?: Date;
  generatedAt: Date;
  updatedAt: Date;
}

const participantSummarySchema = new Schema<IParticipantSummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["host", "participant"], required: true },
    joinedAt: Date,
    leftAt: Date,
  },
  { _id: false }
);

const questionEvaluationSchema = new Schema<IQuestionEvaluation>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "MeetingInterview", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    testCases: [
      {
        args: { type: [String], default: [] },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    solved: { type: Boolean, required: true },
    status: { type: String, enum: ["passed", "failed", "not_submitted"], required: true },
    isSubmitted: { type: Boolean, default: false },
    finalCode: String,
    language: String,
    testResults: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        actualOutput: { type: String, required: true },
        passed: { type: Boolean, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    score: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    summary: { type: String, required: true },
  },
  { _id: false }
);

const interviewReportSchema = new Schema<IInterviewReport>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true, unique: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User" },
    participants: { type: [participantSummarySchema], default: [] },
    questionEvaluations: { type: [questionEvaluationSchema], default: [] },
    overallResult: { type: String, enum: ["passed", "failed"], default: "failed" },
    totalQuestions: { type: Number, default: 0 },
    questionsPassed: { type: Number, default: 0 },
    questionsFailed: { type: Number, default: 0 },
    questionsNotSubmitted: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    overallSummary: { type: String, default: "" },
    hostNotes: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const InterviewReport = mongoose.model<IInterviewReport>("InterviewReport", interviewReportSchema);
export default InterviewReport;