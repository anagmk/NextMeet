import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { Server } from "socket.io";

export const onlineUsers = new Map();

const socketio = (server: any, options: any) => {
  const io = new Server(server, options);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });

  return io;
};

export default socketio;