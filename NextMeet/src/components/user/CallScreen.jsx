import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ChatSideBar from "./ChatSideBar";

export default function CallScreen() {
  const { meetingCode } = useParams();
  const socketRef = useRef();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      socket.emit("join-meeting", meetingCode);
    });

    socket.on("user-joined", (data) => {
      console.log("Another user joined:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [meetingCode]);

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      <p>Call screen for meeting: {meetingCode}</p>
      <ChatSideBar socket={socketRef.current} />
    </div>
  );
}