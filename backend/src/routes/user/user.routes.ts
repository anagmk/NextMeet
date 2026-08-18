import { getUserProfile } from "../../controllers/user/user.controller.js";
import tokenVerify from "../../middlewares/validation.middleware.js";

import express from "express";
const router = express.Router();

router.get("/profile", tokenVerify.authenticateUser, getUserProfile);

export default router;
