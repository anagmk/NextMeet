import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const error = err as any;

  let responseError = error;

  if (!(responseError instanceof ApiError)) {
    const statusCode = responseError.statusCode || 500;
    const message = responseError.message || "Internal server error";
    responseError = new ApiError(statusCode, message, responseError.errors || []);
  }

  if (error?.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e: any) => e.message);
    responseError = new ApiError(400, "Validation failed", messages);
  }

  if (error?.name === "CastError") {
    responseError = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    responseError = new ApiError(409, `${field} already exists`);
  }

  const response = {
    success: false,
    message: responseError.message,
    errors: responseError.errors,

    ...(process.env.NODE_ENV === "development" && { stack: responseError.stack }),
  };

  if (responseError.statusCode >= 500) {
    console.error(error);
  }

  res.status(responseError.statusCode || 500).json(response);
}

export default errorHandler;