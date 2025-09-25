import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/ForgotPassword.module.css";

const EyeIcon = ({ visible }) => {
  return visible ? (
    // Eye Open
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ) : (
    // Eye Closed
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M13.359 11.238l1.396 1.396-1.06 1.06-1.396-1.396a8.879 8.879 0 0 1-4.299 1.364C3 13.662 0 8 0 8s1.53-2.642 4.07-4.31L2.322 2.268l1.06-1.06 11 11-1.06 1.06-1.963-1.963zM5.998 5.998a2 2 0 0 0 2.828 2.828L5.998 5.998z" />
    </svg>
  );
};

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Password reset successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
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
          <form onSubmit={handleReset}>
            {/* New Password */}
            <div className={styles.labelRow}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <span
                className={styles.eyeIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
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
              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
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

            <button type="submit" className={styles.resetButton}>
              RESET PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
