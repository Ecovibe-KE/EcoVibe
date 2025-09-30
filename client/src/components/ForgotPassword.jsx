import React, { useState } from "react";
import Input from "../utils/Input.jsx";
import Button from "../utils/Button.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../css/Login.module.css";
import { forgotPassword } from "../api/services/auth.js";
import { validateEmail } from "../utils/Validations.js";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email);

      if (response.status === "success") {
        toast.success(response.message);
        setEmail("");
      } else {
        toast.error(response.message || "Failed to process request.");
      }
    } catch (err) {
      toast.error(err.message || "Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left side branding */}
      <div className={styles.leftSection}>
        <h1 className={styles.brandTitle}>ECOVIBE</h1>
        <p className={styles.brandSubtitle}>Empowering Sustainable Solutions</p>
        <img src="/Empower.png" alt="EcoVibe" className={styles.empowerImage} />
      </div>

      {/* Right side form */}
      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="mb-4 text-dark" style={{ fontSize: "32px" }}>
              Forgot Password
            </h2>

            {/* Email field */}
            <div className="mb-3">
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                required
                error={errors.email}
              />
            </div>

            <Button
              type="submit"
              size="16px"
              disabled={loading}
              className={`btn btn-success ${styles.loginButton}`}
              borderRadius="10rem"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="mt-3 text-center">
              <Link to="/login">Back to Login</Link>
            </p>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
