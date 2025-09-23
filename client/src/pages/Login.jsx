// src/pages/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
    // TODO: connect to auth backend
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: "#000000",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Left column - image + tagline */}
      <div
        style={{
          width: isMobile ? "100%" : "50%",
          background: "url('/assets/ecovibe-image.png') center/cover no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#ffffff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>ECOVIBE</h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "300px" }}>
          Empowering Sustainable Solutions
        </p>
      </div>

      {/* Right column - login form wrapped in white background */}
      <div
        style={{
          width: isMobile ? "100%" : "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "4rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "3rem",
            borderRadius: "8px",
            width: "100%",
            maxWidth: isMobile ? "100%" : "80%", // ✅ increased width on desktop
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#000000" }}>Log in</h2>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "#000000",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "#000000",
                }}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 3rem 0.75rem 0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  color: "#007BFF",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* reCAPTCHA */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.9rem",
                  color: "#000000",
                }}
              >
                <input type="checkbox" style={{ marginRight: "0.5rem" }} /> I am not a robot
              </label>
            </div>

            {/* Login button + forgot password */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                type="submit"
                style={{
                  padding: "1rem 2rem", // ✅ increased padding
                  backgroundColor: "#37b137",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5a030")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#37b137")}
              >
                Log in
              </button>
              <Link
                to="/forgot-password"
                style={{
                  color: "#000000",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
