import { Router } from "express";
import { generateQuestion } from "../../controllers/user/question.controller.js";
import { authenticateUser } from "../../middlewares/validation.middleware"; // adjust path to match yours

const router = Router();

router.post("/generate", authenticateUser, generateQuestion);

export default router;