  import express from "express";
  import cors from "cors";
  import cookieParser from "cookie-parser";
  import passport from "passport";
  import connectDB from "./config/database.js";
  import authRoutes from "./routes/auth/auth.routes.js";
  import errorHandler from "./middlewares/error.middleware.js";
  import userRoutes from "./routes/user/user.routes.js";
  import meetingsRoutes from "./routes/user/meetings.routes.js";
  import questionRoutes from "./routes/user/question.routes.js";

  const app = express();
  const allowedOrigins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

  connectDB();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || localOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/user", meetingsRoutes);
  app.use("/api/question", questionRoutes);
  app.use(errorHandler);

  export default app;
