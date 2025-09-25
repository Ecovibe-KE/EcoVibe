import React, { useState, useRef, useEffect, useContext } from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/Login.module.css";
import { UserContext } from "../context/UserContext.jsx"; // <-- import UserContext

const Login = () => {
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { setUser } = useContext(UserContext); // <-- get setUser from context
  const navigate = useNavigate();

  useEffect(() => {
    const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
    setSiteKey(key);
    if (!key)
      toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("[TEST MODE] Skipping reCAPTCHA validation");
      console.log("Logging in with:", formData);

      if (formData.email && formData.password) {
        // Example dummy user data - replace with API response
        const loggedInUser = {
          name: "John Doe",
          role: "Admin", // or "Client"
          avatar: "/profile.jpg",
        };

        // Update context
        setUser(loggedInUser);

        // Store auth token & user in localStorage
        localStorage.setItem("authToken", "dummy_token_123");
        localStorage.setItem("userData", JSON.stringify(loggedInUser));

        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1200); // navigate instead of window.location
      } else {
        toast.error("Please enter email and password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Login failed. Please try again.");
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
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className="img-fluid mt-3"
          style={{ width: "100%", maxWidth: "400px", height: "auto" }}
        />
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit}>
            <h2
              className="text-left mb-4 text-dark"
              style={{ fontSize: "40px" }}
            >
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
                className={`btn btn-success ${styles.loginButton}`}
                borderRadius="10rem"
              >
                Login
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
