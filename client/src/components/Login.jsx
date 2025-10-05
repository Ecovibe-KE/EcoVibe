import React, { useState, useRef, useEffect } from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, Navigate } from "react-router-dom";
import styles from "../css/Login.module.css";
import { useAuth } from "../context/AuthContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validateEmail } from "../utils/Validations.js";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
    setSiteKey(key);
    if (!key) {
      toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!recaptchaRef.current) {
      toast.error("reCAPTCHA not loaded. Please refresh the page.");
      return;
    }

    const captchaToken = recaptchaRef.current.getValue();
    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA challenge.");
      return;
    }

    try {
      setLoading(true);

      //  use AuthContext's login (handles localStorage + redirect)
      await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Login successful! Redirecting...");
      Navigate("/dashboard/main", { replace: true });
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.message || null;

      if (backendMessage?.toLowerCase().includes("email")) {
        setErrors({ email: backendMessage });
        toast.error(backendMessage);
      } else if (backendMessage?.toLowerCase().includes("password")) {
        setErrors({ password: backendMessage });
        toast.error(backendMessage);
      } else {
        toast.error("Login failed. Please try again.");
      }

      if (import.meta.env.MODE !== "production") {
        console.error("Login failed:", err);
      }

      if (recaptchaRef.current) recaptchaRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftSection}>
        <h1 className={styles.brandTitle}>ECOVIBE</h1>
        <p className={styles.brandSubtitle}>Empowering Sustainable Solutions</p>
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className={styles.empowerImage}
        />
      </div>

      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="mb-4 text-dark" style={{ fontSize: "40px" }}>
              Log In
            </h2>

            <div className="mb-3">
              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
                autoComplete="new-email"
                spellCheck={false}
              />
            </div>

            <div className="mb-3">
              <label className={styles.passwordLabel} htmlFor="password">
                Password
                <span
                  className={styles.passwordToggle}
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
                autoComplete="new-password"
                spellCheck={false}
              />
            </div>

            <div className="mb-3">
              {siteKey ? (
                <ReCAPTCHA
                  sitekey={siteKey}
                  ref={recaptchaRef}
                  size={window.innerWidth < 768 ? "compact" : "normal"}
                  theme="light"
                />
              ) : (
                <div className="alert alert-warning">
                  reCAPTCHA not configured.
                </div>
              )}
            </div>

            <div className={styles.loginActions}>
              <Button
                type="submit"
                size="16px"
                disabled={loading}
                className={`btn btn-success ${styles.loginButton}`}
                borderRadius="10rem"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Link to="/forgot-password" className={styles.forgotLink}>
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
