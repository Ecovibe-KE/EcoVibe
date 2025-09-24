import React, { useState, useRef, useEffect } from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import "../css/login.css";

const Login = () => {
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
    setSiteKey(key);
    if (!key) {
      toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaRef.current) {
      toast.error("reCAPTCHA not loaded. Please refresh and try again.");
      return;
    }

    try {
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();
      console.log("Logging in with:", { ...formData, token });
      toast.success("Login successful! Redirecting...");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <div className="login-branding-overlay">
          <h1 className="login-brand-title">ECOVIBE</h1>
          <p className="login-brand-subtitle">
            Empowering Sustainable Solutions
          </p>
        </div>
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className="login-image-img"
        />
      </div>

      <div className="login-container">
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <h2 className="login-heading">Log In</h2>

            <div className="mb-4">
              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              {siteKey ? (
                <ReCAPTCHA sitekey={siteKey} ref={recaptchaRef} size="normal" />
              ) : (
                <div className="alert alert-warning">
                  reCAPTCHA not configured.
                </div>
              )}
            </div>

            <div className="login-actions">
              <Button
                type="submit"
                size="lg"
                className="login-btn"
                borderRadius="10rem"
                color="#37B137"
              >
                Login
              </Button>

              <Link to="/forgot-password" className="login-link">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
