import React, { useState } from "react";
import Button from "./utils/Button.jsx";
import Input from "./utils/Input.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/forgotPassword.css";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill out both fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // ✅ Call API to reset password here
    console.log("Password reset with:", formData.newPassword);
    toast.success("Password reset successful! Please log in.");
    setFormData({ newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="auth-wrapper">
      {/* Left side: Image + Branding */}
      <div className="auth-image">
        <img
          src="/assets/login-side-image.png"
          alt="EcoVibe Illustration"
          className="auth-image-img"
        />
        <div className="auth-branding">
          <h1 className="auth-brand-title">ECOVIBE</h1>
          <p className="auth-brand-subtitle">
            Empowering Sustainable Solutions
          </p>
        </div>
      </div>

      {/* Right side: Forgot Password Form */}
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="mb-4" style={{ fontWeight: "bold" }}>
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Input
                type="password"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-100"
              borderRadius="10rem"
              color="#37B137"
              textColor="#fff"
            >
              RESET PASSWORD
            </Button>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
