import mongoose, { Schema, Document, Types } from "mongoose";

interface ITestCase {
  args: string[];           // was: input: string
  expectedOutput: string;
  isHidden: boolean;
}

interface IAnswer {
  submittedBy: Types.ObjectId;
  code: string;
  language: string;
  submittedAt: Date;
}

export interface IMeetingInterview extends Document {
  meetingId: Types.ObjectId;
  generatedBy: Types.ObjectId;
  title: string;
  description: string;
  starterCode: string;
  functionName: string;      // NEW
  language: string;
  testCases: ITestCase[];
  answers: IAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>(
  {
    args: { type: [String], required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const answerSchema = new Schema<IAnswer>(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const meetingInterviewSchema = new Schema<IMeetingInterview>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    starterCode: { type: String, required: true },
    functionName: { type: String, required: true, default: "solve" },
    language: { type: String, required: true },
    testCases: { type: [testCaseSchema], default: [] },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

meetingInterviewSchema.index({ meetingId: 1 });

const MeetingInterview = mongoose.model<IMeetingInterview>("MeetingInterview", meetingInterviewSchema);
export default MeetingInterview;