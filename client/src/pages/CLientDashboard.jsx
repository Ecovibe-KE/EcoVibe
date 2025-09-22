// Test page
import React from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const ClientDashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="container text-center mt-5">
      <h1>Welcome to Your Dashboard</h1>
      <p>This is a protected page that only logged-in users can see.</p>
      <Button
        className="text-white mt-3"
        style={{ backgroundColor: "#37b137", border: "none" }}
        onClick={logout}
      >
        Logout
      </Button>
    </div>
  );
};

export default ClientDashboard;
