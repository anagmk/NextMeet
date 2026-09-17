import { getUserProfile, updateUserProfile, getSettings, updateSettings, changePassword, logoutAllDevices, deleteAccount, exportAccountData } from "../../controllers/user/user.controller.js";
import  {authenticateUser,authorizeRole} from "../../middlewares/validation.middleware.js";

import express from "express";
const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.patch("/profile", authenticateUser, updateUserProfile);
router.get("/settings", authenticateUser, getSettings);
router.patch("/settings", authenticateUser, updateSettings);
router.post("/settings/password", authenticateUser, changePassword);
router.post("/settings/logout-all", authenticateUser, logoutAllDevices);
router.delete("/settings/account", authenticateUser, deleteAccount);
router.get("/settings/export", authenticateUser, exportAccountData);
export default router;
