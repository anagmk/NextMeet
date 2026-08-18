"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
const socket_io_client_1 = require("socket.io-client");
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop();
        return cookieValue?.split(";").shift();
    }
    return undefined;
};
const token = getCookie("token");
exports.socket = (0, socket_io_client_1.io)(process.env.VITE_SOCKET_URL || "http://localhost:5000", {
    withCredentials: true,
    auth: { token },
});
exports.socket.on("connect", () => {
    console.log("Connected to server:", exports.socket.id);
});
exports.socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
exports.socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
});
