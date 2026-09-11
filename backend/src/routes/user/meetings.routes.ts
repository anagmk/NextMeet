import express from "express";
import {createMeeting,getMeetings,getMeetingById,getMeetingByCode,joinMeeting,leaveMeeting,deleteMeeting,closeMeeting,meetingHistory} from "../../controllers/user/meetings.controller.js";
import { getMeetingDetails } from "../../controllers/user/meetingDetails.controller.js";
import  {authenticateUser,authorizeRole,} from "../../middlewares/validation.middleware.js";
import { sendMessage, getMessages } from "../../controllers/user/message.controller.js";
import {getReport,updateReportNotes,publishReport,getNotifications,markNotificationRead} from "../../controllers/user/report.controller.js";

const router = express.Router();

router.post("/meetings/create", authenticateUser, createMeeting);
router.get("/meetings", authenticateUser, getMeetings);
router.get("/meetings/code/:meetingCode", authenticateUser, getMeetingByCode);
router.get("/meetings/:meetingCode/details", authenticateUser, getMeetingDetails);
router.post("/meetings/:meetingCode/messages", authenticateUser, sendMessage);
router.get("/meetings/:meetingCode/messages", authenticateUser, getMessages);
router.get("/meetings/history", authenticateUser, meetingHistory);
router.get("/meetings/:id", authenticateUser, getMeetingById);
router.post("/meetings/join", authenticateUser, joinMeeting);
router.post("/meetings/:id/leave", authenticateUser, leaveMeeting);
router.delete("/meetings/:id", authenticateUser, deleteMeeting);
router.post("/meetings/:id/close", authenticateUser, closeMeeting);
router.get("/meetings/:meetingCode/report", authenticateUser, getReport);
router.patch("/meetings/:meetingCode/report", authenticateUser, updateReportNotes);
router.post("/meetings/:meetingCode/report/publish", authenticateUser, publishReport);
router.get("/notifications", authenticateUser, getNotifications);
router.patch("/notifications/:notificationId/read", authenticateUser, markNotificationRead);




export default router;