import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RequireRole = ({ allowedRoles, children }) => {
  const { user, isHydrating } = useAuth();

  // Wait until AuthContext finishes hydration before deciding
  if (isHydrating) return null; // or a spinner/loader

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
