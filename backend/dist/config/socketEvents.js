"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
const socket_io_1 = require("socket.io");
exports.onlineUsers = new Map();
const socketio = (server, options) => {
    const io = new socket_io_1.Server(server, options);
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);
    });
    return io;
};
exports.default = socketio;
