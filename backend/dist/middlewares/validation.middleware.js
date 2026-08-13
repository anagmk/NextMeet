"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
async function authenticateUser(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new ApiError_1.default(401, "Not authenticated"));
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            const authError = err;
            if (authError.name === "TokenExpiredError") {
                return next(new ApiError_1.default(401, "Session expired"));
            }
            return next(new ApiError_1.default(401, "Invalid token"));
        }
        const user = await user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return next(new ApiError_1.default(401, "User no longer exists"));
        }
        if (user.isBlocked) {
            return next(new ApiError_1.default(403, "Account has been blocked"));
        }
        req.user = user; // controllers/services rely on req.user from here on
        next();
    }
    catch (err) {
        next(err);
    }
}
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        const requestUser = req.user;
        if (!requestUser?.role) {
            return next(new ApiError_1.default(401, "Not authenticated"));
        }
        if (!allowedRoles.includes(requestUser.role)) {
            return next(new ApiError_1.default(403, "Not authorized for this action"));
        }
        next();
    };
}
exports.default = {
    authenticateUser,
    authorizeRole,
};
