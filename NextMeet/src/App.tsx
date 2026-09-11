import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";

import Dashboard from "./pages/user/Dashboard";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import Profile from "./pages/user/Profile";
import ScheduleMeeting from "./pages/user/NewMeeting";
import JoinLobby from "./components/user/JoinLobby";
import CallScreen from "./components/user/CallScreen";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import JoinMeeting from "./pages/user/JoinMeeting";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import Meetings from "./pages/user/Meetings";
import ReportPage from "./pages/user/ReportPageUi";
import MeetingDetailsPage from "./pages/user/MeetingDetailsPage";
import MeetingsHistory from "./pages/user/history";
import LandingPage from "./pages/public/LandingPage";
import AboutNextMeet from "./components/user/about";
import TermsConditions from "./components/user/TermsConditions";
import Navbar from "./components/user/Navbar";
import Sidebar from "./components/user/Sidebar";

function MeetingRoute() {
  const location = useLocation();

  return location.state?.skipLobby ? <CallScreen /> : <JoinLobby />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <Sidebar />

      <div className="min-h-screen md:ml-[250px]">
        <Navbar />
        <main className="px-3 py-3 md:px-6">{children}</main>
      </div>
    </div>
  );
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}/>
      <Route path="/register" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/create-meeting" element={<ProtectedRoute><ScheduleMeeting /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><MeetingsHistory/></ProtectedRoute>} />
      <Route path="/join/:meetingCode" element={<ProtectedRoute><JoinLobby /></ProtectedRoute>} />
      <Route path="/meet/:meetingCode" element={<ProtectedRoute><MeetingRoute /></ProtectedRoute>} />
      <Route path="/join-meeting" element={<ProtectedRoute><JoinMeeting /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
      <Route path="/meetings/:meetingCode/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/meetings/:meetingCode/details" element={<ProtectedRoute><MeetingDetailsPage /></ProtectedRoute>}/>
      <Route path="/about" element={<ProtectedRoute><AppLayout><AboutNextMeet /></AppLayout></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><AppLayout><TermsConditions /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
