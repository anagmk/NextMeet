import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App
