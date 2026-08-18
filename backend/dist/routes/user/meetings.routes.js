"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meetings_controller_js_1 = require("../../controllers/user/meetings.controller.js");
const validation_middleware_js_1 = __importDefault(require("../../middlewares/validation.middleware.js"));
const router = express_1.default.Router();
router.post("/meetings", validation_middleware_js_1.default.authenticateUser, meetings_controller_js_1.createMeeting);
exports.default = router;
