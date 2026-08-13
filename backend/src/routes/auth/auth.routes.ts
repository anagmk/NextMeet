import { signup, login, refresh, logout, googleAuthCallback } from "../../controllers/auth/auth.controller.js";
import passport from "../../config/passport.js";
import tokenVerify from "../../middlewares/validation.middleware.js";

import express from "express";
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  googleAuthCallback
);
router.get("/signup", (req, res) => {
  res.send("Signup page");
});
router.post("/signup", signup);
router.get("/login", (req, res) => {
  res.send("Login page");
});
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
