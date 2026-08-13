"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    statusCode;
    errors;
    success;
    isOperational;
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors; // array of field-level validation errors, if any
        this.success = false;
        this.isOperational = true; // distinguishes expected errors from bugs/crashes
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ApiError;
