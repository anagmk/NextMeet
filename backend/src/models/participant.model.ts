import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["host", "participant"],
      default: "participant",
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

export const Participant = participantSchema;
