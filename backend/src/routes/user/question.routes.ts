import { Router } from "express";
import { createManualQuestion, generateQuestion, submitQuestionAnswer } from "../../controllers/user/question.controller.js";
import { authenticateUser } from "../../middlewares/validation.middleware"; // adjust path to match yours

const router = Router();

router.post("/generate", authenticateUser, generateQuestion);
router.post("/manual", authenticateUser, createManualQuestion);
router.post("/:questionId/submit", authenticateUser, submitQuestionAnswer);

export default router;
