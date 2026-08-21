"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const app_js_1 = __importDefault(require("./app.js"));
const socketEvents_js_1 = require("./config/socketEvents.js");
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app_js_1.default);
(0, socketEvents_js_1.setupSocket)(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
