import React from "react";

const Logout = ({ onLogout, onCancel }) => {
  const handleLogout = () => {
    // 🧪 Mock logout logic
    setTimeout(() => {
      onLogout(); // Clear user state in parent
    }, 500);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Are you sure you want to logout?</h3>
        <div style={styles.buttons}>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", textAlign: "center", width: "300px" },
  buttons: { marginTop: "1.5rem", display: "flex", justifyContent: "space-around" },
  logoutButton: { backgroundColor: "#37b137", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  cancelButton: { backgroundColor: "#ccc", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
};

export default Logout;
