// Tickets.jsx
import { useAuth } from "../context/AuthContext";
import ClientTickets from "./ClientTicket";
import AdminTickets from "./admin/AdminTicket";

export default function Tickets() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading tickets...</p>; // or redirect to login
  }

  const isAdmin =
    user?.role?.toLowerCase() === "admin" || user?.role === "super_admin";

  return isAdmin ? <AdminTickets /> : <ClientTickets />;
}
