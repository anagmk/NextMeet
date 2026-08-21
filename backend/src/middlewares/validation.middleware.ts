import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new ApiError(401, "Not authenticated"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    } catch (err) {
      const authError = err as Error & { name?: string };
      if (authError.name === "TokenExpiredError") {
        return next(new ApiError(401, "Session expired"));
      }
      return next(new ApiError(401, "Invalid token"));
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, "Account has been blocked"));
    }

    req.user = user; // controllers/services rely on req.user from here on
    next();
  } catch (err) {
    next(err);
  }
}

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestUser = req.user as { role?: string } | undefined;
    if (!requestUser?.role) {
      return next(new ApiError(401, "Not authenticated"));
    }

    if (!allowedRoles.includes(requestUser.role)) {
      return next(new ApiError(403, "Not authorized for this action"));
    }

    next();
  };
}
