// src/components/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import styles from "../css/Login.module.css"; // reuse same layout
import { resetPassword } from "../api/services/auth.js";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ✅ extract token from reset link

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ token, newPassword: formData.newPassword });

      toast.success("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.message || "Reset failed";
      toast.error(backendMessage);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left branding section */}
      <div className={styles.leftSection}>
        <h1 className={styles.brandTitle}>ECOVIBE</h1>
        <p className={styles.brandSubtitle}>Empowering Sustainable Solutions</p>
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className={styles.empowerImage}
        />
      </div>

      {/* Right reset password form */}
      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="mb-4 text-dark" style={{ fontSize: "40px" }}>
              Reset Password
            </h2>

            {/* New password */}
            <div className="mb-3">
              <Input
                type="password"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                error={errors.newPassword}
              />
            </div>

            {/* Confirm password */}
            <div className="mb-3">
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />
            </div>

            {/* Submit */}
            <div className={styles.loginActions}>
              <Button
                type="submit"
                size="16px"
                disabled={loading}
                className={`btn btn-success ${styles.loginButton}`}
                borderRadius="10rem"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ResetPassword;
