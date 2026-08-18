"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_js_1 = require("../../controllers/user/user.controller.js");
const validation_middleware_js_1 = __importDefault(require("../../middlewares/validation.middleware.js"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/profile", validation_middleware_js_1.default.authenticateUser, user_controller_js_1.getUserProfile);
exports.default = router;
