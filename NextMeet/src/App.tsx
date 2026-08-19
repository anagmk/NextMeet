import { Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";

import Dashboard from "./components/dashboard/Dashboard";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Profile from "./pages/user/Profile.jsx";
import ScheduleMeeting from "./pages/user/NewMeeting.jsx";
import JoinLobby from "./components/user/JoinLobby.jsx";
import CallScreen from "./components/user/CallScreen.jsx";

function MeetingRoute() {
  const location = useLocation();

  return location.state?.skipLobby ? <CallScreen /> : <JoinLobby />;
}

function App() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.log("Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create-meeting" element={<ScheduleMeeting />} />
      <Route path="/join/:meetingCode" element={<JoinLobby />} />
      <Route path="/meet/:meetingCode" element={<MeetingRoute />} />
      <Route path="/join" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
