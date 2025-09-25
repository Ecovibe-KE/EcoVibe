import React from "react";
import LogoutButton from "../utils/LogoutButton.jsx";

const Header = ({ user, onLogout }) => {
  if (!user) return null; // No header content until user is loaded

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "#ffffff", // Keep white to match design
        padding: "0.75rem 2rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)", // subtle shadow
      }}
    >
      {/* Container for avatar, name, role and button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Avatar */}
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="User Avatar"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        {/* Name + Role */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#000" }}>
            {user.name}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#555" }}>
            {user.role}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            backgroundColor: "#2ecc71", // Your hex green
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "0.5rem 1rem",
            fontSize: "0.9rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
