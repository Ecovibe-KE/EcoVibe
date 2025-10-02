// Tickets.jsx
import { useAuth } from "../context/AuthContext";
import ClientTickets from "./ClientTickets";
import AdminTickets from "./admin/AdminTickets";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

export default function Tickets() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug(
        "Tickets: user",
        user,
        "role",
        user?.role,
        "loading",
        loading,
      );
    }
  }, [user, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <Spinner animation="border" variant="success" />
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin" || role === "super_admin";

  if (import.meta.env.DEV) console.debug("Tickets: isAdmin", isAdmin);

  return isAdmin ? <AdminTickets /> : <ClientTickets />;
}
