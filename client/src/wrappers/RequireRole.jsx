import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RequireRole = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default RequireRole;
