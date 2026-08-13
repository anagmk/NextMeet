import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import connectDB from "../src/config/database.js";
import authRoutes from "./routes/auth/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user/user.routes.js";

const app = express();


connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use(errorHandler);

export default app;
