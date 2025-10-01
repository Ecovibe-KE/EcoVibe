// Tickets.jsx
import { useAuth } from "../context/AuthContext";
import ClientTickets from "./ClientTicket";
import AdminTickets from "./admin/AdminTicket";
import { Navigate } from "react-router-dom";

export default function Tickets() {
  const { user } = useAuth();

  if (!user) {
     return <Navigate to="/login" replace />; // or redirect to login
  }

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin" || role === "super_admin";

  return isAdmin ? <AdminTickets /> : <ClientTickets />;
}
