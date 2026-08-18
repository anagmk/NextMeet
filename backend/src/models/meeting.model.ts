// models/meeting.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

interface IParticipant {
  userId: Types.ObjectId;
  role: "host" | "participant";
  joinedAt?: Date;
}

export interface IMeeting extends Document {
  title: string;
  description?: string;
  hostId: Types.ObjectId;
  meetingCode: string;
  scheduledAt: Date;
  duration?: number;
  status: "scheduled" | "active" | "completed";
  participants: IParticipant[];
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["host", "participant"], default: "participant" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    meetingCode: { type: String, required: true, unique: true, uppercase: true },
    scheduledAt: { type: Date, required: true, default: Date.now },
    duration: { type: Number }, // in minutes, optional
    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "scheduled",
    },
    participants: { type: [participantSchema], default: [] },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Extra indexes for your common query patterns
meetingSchema.index({ "participants.userId": 1 });
meetingSchema.index({ hostId: 1 });

const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
export default Meeting;