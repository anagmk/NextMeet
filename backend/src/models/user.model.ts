import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;

  googleId?: string | null;
  authProvider?: "local" | "google";
  profileImage?: string;
  bio?: string;

  role: UserRole;

  skills: string[];
  experience?: number;

  isBlocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    password: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
