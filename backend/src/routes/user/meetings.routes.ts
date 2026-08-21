import express from "express";
import {createMeeting,getMeetings,getMeetingById,getMeetingByCode,joinMeeting,leaveMeeting,closeMeeting,meetingHistory} from "../../controllers/user/meetings.controller.js";
import  {authenticateUser,authorizeRole,} from "../../middlewares/validation.middleware.js";
import { sendMessage, getMessages } from "../../controllers/user/message.controller.js";

const router = express.Router();

router.post("/meetings/create", authenticateUser, createMeeting);
router.get("/meetings", authenticateUser, getMeetings);
router.get("/meetings/code/:meetingCode", authenticateUser, getMeetingByCode);
router.post("/meetings/:meetingCode/messages", authenticateUser, sendMessage);
router.get("/meetings/:meetingCode/messages", authenticateUser, getMessages);
router.get("/meetings/history", authenticateUser, meetingHistory);
router.get("/meetings/:id", authenticateUser, getMeetingById);
router.post("/meetings/join", authenticateUser, joinMeeting);
router.post("/meetings/:id/leave", authenticateUser, leaveMeeting);
// router.post("/meetings/:id/close", authenticateUser, closeMeeting);


export default router;