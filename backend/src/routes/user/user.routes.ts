import { getUserProfile } from "../../controllers/user/user.controller.js";
import  {authenticateUser,authorizeRole} from "../../middlewares/validation.middleware.js";

import express from "express";
const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);

export default router;
