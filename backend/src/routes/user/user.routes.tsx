import { getProfile } from "../../controllers/user/user.controller.js";
import tokenVerify from "../../middlewares/validation.middleware.js";

import express from "express";
const router = express.Router();

router.get("/profile", tokenVerify.authenticateUser, getProfile);

export default router;
