import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useUser } from "../../context/UserContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;