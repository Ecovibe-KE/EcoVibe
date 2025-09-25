// src/utils/LogoutButton.jsx
import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    // Clear stored auth data
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");

    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

      <style>{`
        .logout-btn {
          background-color: #37B137;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }
        .logout-btn:hover {
          background-color: #2d8b2d;
        }

        @media (max-width: 768px) {
          .logout-btn {
            width: 100%;
            text-align: center;
            padding: 0.6rem;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};

export default LogoutButton;
