import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  meetingId?: Types.ObjectId;
  meetingCode?: string;
  reportId?: Types.ObjectId;
  type: "report_published";
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    meetingId: { type: Schema.Types.ObjectId, ref: "Meeting" },
    meetingCode: { type: String, default: "" },
    reportId: { type: Schema.Types.ObjectId, ref: "InterviewReport" },
    type: { type: String, enum: ["report_published"], default: "report_published" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, meetingId: 1, type: 1 }, { unique: false });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
