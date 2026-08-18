import { io } from "socket.io-client";

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    return cookieValue?.split(";").shift();
  }
  return undefined;
};

const token = getCookie("token");

export const socket = io(process.env.VITE_SOCKET_URL || "http://localhost:5000", {
  withCredentials: true,
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});