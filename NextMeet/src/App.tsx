import { Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";

import Dashboard from "./pages/user/Dashboard";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Profile from "./pages/user/Profile";
import ScheduleMeeting from "./pages/user/NewMeeting";
import JoinLobby from "./components/user/JoinLobby";
import CallScreen from "./components/user/CallScreen";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import JoinMeeting from "./pages/user/JoinMeeting";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import Meetings from "./pages/user/Meetings";

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
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}/>
      <Route path="/register" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/create-meeting" element={<ProtectedRoute><ScheduleMeeting /></ProtectedRoute>} />
      <Route path="/join/:meetingCode" element={<ProtectedRoute><JoinLobby /></ProtectedRoute>} />
      <Route path="/meet/:meetingCode" element={<ProtectedRoute><MeetingRoute /></ProtectedRoute>} />
      <Route path="/join-meeting" element={<ProtectedRoute><JoinMeeting /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
