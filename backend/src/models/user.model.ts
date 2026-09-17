import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUserSettings {
  appearance: { theme: "light" | "dark" | "system"; language: "English"; reducedMotion: boolean; keyboardNavigation: boolean };
  meeting: { previewBeforeJoin: boolean; defaultCameraOn: boolean; defaultMicOn: boolean; joinDirectly: boolean };
  editor: { theme: "dark" | "light" | "system"; fontSize: number; tabSize: 2 | 4 | 8; lineNumbers: boolean; wordWrap: boolean; minimap: boolean; defaultLanguage: "javascript" | "typescript" | "python" | "java"; autoSave: boolean };
  notifications: { inApp: boolean; email: boolean; meetingReminders: boolean; joinRequests: boolean; interviewReports: boolean; sound: boolean };
}

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
  isEmailVerified?: boolean;
  signupOtpHash?: string;
  signupOtpExpires?: Date;
  resetPasswordOtpHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  settings: IUserSettings;


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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    signupOtpHash: {
      type: String,
    },
    signupOtpExpires: {
      type: Date,
    },
    resetPasswordOtpHash: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
    settings: {
      appearance: {
        theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
        language: { type: String, enum: ["English"], default: "English" },
        reducedMotion: { type: Boolean, default: false },
        keyboardNavigation: { type: Boolean, default: true },
      },
      meeting: {
        previewBeforeJoin: { type: Boolean, default: true },
        defaultCameraOn: { type: Boolean, default: true },
        defaultMicOn: { type: Boolean, default: true },
        joinDirectly: { type: Boolean, default: false },
      },
      editor: {
        theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
        fontSize: { type: Number, min: 10, max: 24, default: 14 },
        tabSize: { type: Number, enum: [2, 4, 8], default: 2 },
        lineNumbers: { type: Boolean, default: true },
        wordWrap: { type: Boolean, default: false },
        minimap: { type: Boolean, default: false },
        defaultLanguage: { type: String, enum: ["javascript", "typescript", "python", "java"], default: "javascript" },
        autoSave: { type: Boolean, default: false },
      },
      notifications: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        meetingReminders: { type: Boolean, default: true },
        joinRequests: { type: Boolean, default: true },
        interviewReports: { type: Boolean, default: true },
        sound: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
