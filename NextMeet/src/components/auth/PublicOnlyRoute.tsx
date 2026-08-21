import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useUser } from "../../context/UserContext";

const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicOnlyRoute;