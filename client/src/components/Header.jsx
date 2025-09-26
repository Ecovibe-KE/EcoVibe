import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Header.module.css";
import { UserContext } from "../context/UserContext.jsx";

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Reset user context to guest
    setUser({ name: "Guest", role: "Client", avatar: "/default-avatar.png" });

    // Clear localStorage tokens/data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Redirect to login page (prevent back navigation)
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.rightSection}>
        {/* Profile Avatar */}
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="Profile Avatar"
          className={styles.avatar}
          onError={(e) => {
            if (e.currentTarget.src !== "/default-avatar.png") {
              e.currentTarget.src = "/default-avatar.png";
              }
              }}
        />

        {/* User Info */}
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>

        {/* Logout Button */}
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
