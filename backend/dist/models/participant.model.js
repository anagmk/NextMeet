"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const participantSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { _id: false });
exports.Participant = participantSchema;
