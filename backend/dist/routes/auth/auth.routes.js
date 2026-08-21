"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_js_1 = require("../../controllers/auth/auth.controller.js");
const passport_js_1 = __importDefault(require("../../config/passport.js"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/google", passport_js_1.default.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport_js_1.default.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }), auth_controller_js_1.googleAuthCallback);
router.post("/signup", auth_controller_js_1.signup);
router.post("/login", auth_controller_js_1.login);
router.post("/refresh", auth_controller_js_1.refresh);
router.post("/logout", auth_controller_js_1.logout);
exports.default = router;
