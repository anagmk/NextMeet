// models/interviewSubmission.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

interface ITestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
}

export interface IInterviewSubmission extends Document {
  meetingId: Types.ObjectId;
  questionId?: Types.ObjectId;
  candidateId: Types.ObjectId;
  hostId: Types.ObjectId;
  question: {
    title: string;
    description: string;
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  };
  language: string;
  code: string;
  testResults: ITestCaseResult[];
  solved: boolean; // true if ALL test cases passed
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseResultSchema = new Schema<ITestCaseResult>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    actualOutput: { type: String, required: true },
    passed: { type: Boolean, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const interviewSubmissionSchema = new Schema<IInterviewSubmission>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
    questionId: { type: Schema.Types.ObjectId, ref: "MeetingInterview" },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      testCases: [
        {
          input: String,
          expectedOutput: String,
          isHidden: Boolean,
        },
      ],
    },
    language: { type: String, required: true },
    code: { type: String, required: true },
    testResults: { type: [testCaseResultSchema], default: [] },
    solved: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

interviewSubmissionSchema.index({ meetingId: 1 });
interviewSubmissionSchema.index({ candidateId: 1 });

const InterviewSubmission = mongoose.model<IInterviewSubmission>(
  "InterviewSubmission",
  interviewSubmissionSchema
);
export default InterviewSubmission;