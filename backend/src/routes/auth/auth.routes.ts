import { signup, login, refresh, logout, googleAuthCallback, forgotPassword, resendResetOtp, resetPassword, resendSignupOtp, verifyResetOtp, verifySignupOtp } from "../../controllers/auth/auth.controller.js";
import passport from "../../config/passport.js";

import express from "express";
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  googleAuthCallback
);

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/resend-signup-otp", resendSignupOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/resend-reset-otp", resendResetOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
