"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const database_js_1 = __importDefault(require("../src/config/database.js"));
const auth_routes_js_1 = __importDefault(require("./routes/auth/auth.routes.js"));
const error_middleware_js_1 = __importDefault(require("./middlewares/error.middleware.js"));
const user_routes_js_1 = __importDefault(require("./routes/user/user.routes.js"));
const meetings_routes_js_1 = __importDefault(require("./routes/user/meetings.routes.js"));
const app = (0, express_1.default)();
(0, database_js_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/user", user_routes_js_1.default);
app.use("/api/user", meetings_routes_js_1.default);
app.use(error_middleware_js_1.default);
exports.default = app;
