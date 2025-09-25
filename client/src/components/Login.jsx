import React, { useState, useRef, useEffect, useContext } from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/Login.module.css";
import { UserContext } from "../context/UserContext.jsx";
import { loginUser } from "../api/services/auth.js"; // ✅ using your service

const Login = () => {
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // reCAPTCHA (optional, test mode can skip)
      console.log("[TEST MODE] Skipping reCAPTCHA validation");

      // ✅ Call API via axios service
      const data = await loginUser(formData);

      // Example expected response
      // { token: "jwt_token_here", user: { name: "John Doe", role: "Admin", avatar: "/profile.jpg" } }

      if (data?.token && data?.user) {
        // Save to context & localStorage
        setUser(data.user);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));

        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        toast.error("Invalid login response. Please try again.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <div className={styles.brandWrapper}>
          <h1 className={styles.brandTitle}>ECOVIBE</h1>
          <p className={styles.brandSubtitle}>
            Empowering Sustainable Solutions
          </p>
        </div>

        {/* Empower illustration (hidden on mobile via CSS) */}
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className={`${styles.empowerImage} img-fluid mt-3`}
        />
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit}>
            <h2 className="text-left mb-4 text-dark" style={{ fontSize: "40px" }}>
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
                autoComplete="new-email"
                spellCheck={false}
              />
            </div>

            <div className="mb-3">
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
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
