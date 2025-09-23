import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ title, userName, userRole, userImage }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1.5rem",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #eaeaea",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Page Title */}
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: "600",
          margin: 0,
          color: "#000000",
        }}
      >
        {title}
      </h2>

      {/* Right: User Profile + Dropdown */}
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: "0.75rem",
          }}
        >
          <img
            src={userImage || "/default-user.png"} // fallback to a default avatar
            alt="User"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: "600" }}>{userName}</p>
            <span style={{ fontSize: "0.8rem", color: "#888" }}>{userRole}</span>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              marginTop: "0.5rem",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              minWidth: "150px",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                fontSize: "0.95rem",
                cursor: "pointer",
                color: "#ff4d4f",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#f9f9f9")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
