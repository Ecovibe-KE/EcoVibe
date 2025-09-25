import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/ForgotPassword.module.css";
import { forgotPassword } from "../api/services/auth.js";

const EyeIcon = ({ visible }) => {
  return visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.359 11.238l1.396 1.396-1.06 1.06-1.396-1.396a8.879 8.879 0 0 1-4.299 1.364C3 13.662 0 8 0 8s1.53-2.642 4.07-4.31L2.322 2.268l1.06-1.06 11 11-1.06 1.06-1.963-1.963zM5.998 5.998a2 2 0 0 0 2.828 2.828L5.998 5.998z" />
    </svg>
  );
};

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(newPassword); // calls auth.js service
      console.log("Reset response:", response);

      alert(response?.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Password reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <h1 className={styles.brandTitle}>ECOVIBE</h1>
        <p className={styles.brandSubtitle}>Empowering Sustainable Solutions</p>
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className="img-fluid mt-3"
          style={{ width: "400px", height: "auto" }}
        />
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.subheading}>Forgot Password</h2>

          {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

          <form onSubmit={handleReset}>
            {/* New Password */}
            <div className={styles.labelRow}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <span className={styles.eyeIcon} onClick={() => setShowNewPassword(!showNewPassword)}>
                <EyeIcon visible={showNewPassword} />
              </span>
            </div>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              required
            />

            {/* Confirm Password */}
            <div className={styles.labelRow}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <span className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <EyeIcon visible={showConfirmPassword} />
              </span>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />

            <button type="submit" className={styles.resetButton} disabled={loading}>
              {loading ? "Resetting..." : "RESET PASSWORD"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
