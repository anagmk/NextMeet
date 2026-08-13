"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_js_1 = __importDefault(require("../utils/ApiError.js"));
function errorHandler(err, req, res, next) {
    const error = err;
    let responseError = error;
    if (!(responseError instanceof ApiError_js_1.default)) {
        const statusCode = responseError.statusCode || 500;
        const message = responseError.message || "Internal server error";
        responseError = new ApiError_js_1.default(statusCode, message, responseError.errors || []);
    }
    if (error?.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        responseError = new ApiError_js_1.default(400, "Validation failed", messages);
    }
    if (error?.name === "CastError") {
        responseError = new ApiError_js_1.default(400, `Invalid ${error.path}: ${error.value}`);
    }
    if (error?.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        responseError = new ApiError_js_1.default(409, `${field} already exists`);
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
exports.default = errorHandler;
