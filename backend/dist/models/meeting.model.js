"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const participant_model_js_1 = require("./participant.model.js");
const meetingSchema = new mongoose_1.default.Schema({
    hostId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
    },
    meetingCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ["scheduled", "live", "completed", "cancelled"],
        default: "scheduled",
        index: true,
    },
    participants: {
        type: [participant_model_js_1.Participant],
        default: [],
    },
}, {
    timestamps: true,
});
const Meeting = mongoose_1.default.model("Meeting", meetingSchema);
exports.default = Meeting;
