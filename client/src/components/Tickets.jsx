// Tickets.jsx
import { useAuth } from "../context/AuthContext";
import ClientTickets from "./ClientTickets";
import AdminTickets from "./admin/AdminTickets";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function Tickets() {
  const { user } = useAuth();

  // Debug: log the user state
  useEffect(() => {
    console.log('Tickets component - User:', user);
    console.log('Tickets component - User role:', user?.role);
  }, [user]);

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin" || role === "super_admin";

  console.log('User role:', role, 'Is admin:', isAdmin);

  return isAdmin ? <AdminTickets /> : <ClientTickets />;
}