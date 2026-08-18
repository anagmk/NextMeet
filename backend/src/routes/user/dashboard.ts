import express from "express";

const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.status(200).json({ message: "Dashboard route ready" });
});

export default router;
