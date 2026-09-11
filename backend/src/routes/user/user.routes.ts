import { getUserProfile, updateUserProfile } from "../../controllers/user/user.controller.js";
import  {authenticateUser,authorizeRole} from "../../middlewares/validation.middleware.js";
import { judge0 } from "../../controllers/user/judge.controller.js";

import express from "express";
const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.patch("/profile", authenticateUser, updateUserProfile);
router.post("/judge/run", judge0)


export default router;
