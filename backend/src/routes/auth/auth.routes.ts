import { signup, login, refresh, logout, googleAuthCallback } from "../../controllers/auth/auth.controller.js";
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
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
