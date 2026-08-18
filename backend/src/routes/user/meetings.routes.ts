import express from "express";
import {createMeeting,getMeetings,getMeetingById,getMeetingByCode,joinMeeting,leaveMeeting,closeMeeting,meetingHistory} from "../../controllers/user/meetings.controller.js";
import tokenVerify from "../../middlewares/validation.middleware.js";
import { sendMessage, getMessages } from "../../controllers/user/message.controller.js";

const router = express.Router();

router.post("/meetings/create", tokenVerify.authenticateUser, createMeeting);
router.get("/meetings", tokenVerify.authenticateUser, getMeetings);
router.get("/meetings/code/:meetingCode", tokenVerify.authenticateUser, getMeetingByCode);
router.post("/meetings/:meetingCode/messages", tokenVerify.authenticateUser, sendMessage);
router.get("/meetings/:meetingCode/messages", tokenVerify.authenticateUser, getMessages);
router.get("/meetings/history", tokenVerify.authenticateUser, meetingHistory);
router.get("/meetings/:id", tokenVerify.authenticateUser, getMeetingById);
router.post("/meetings/join", tokenVerify.authenticateUser, joinMeeting);
router.post("/meetings/:id/leave", tokenVerify.authenticateUser, leaveMeeting);
router.post("/meetings/:id/close", tokenVerify.authenticateUser, closeMeeting);


export default router;