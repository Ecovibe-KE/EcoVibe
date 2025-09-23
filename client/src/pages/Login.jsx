// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: "#1E1E1E",
      }}
    >
      {/* Left column */}
      <div
        style={{
          width: isMobile ? "100%" : isTablet ? "45%" : "40%",
          backgroundColor: "#1E1E1E",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          color: "#ffffff",
          textAlign: "center",
          padding: isMobile ? "2rem 1rem" : "4rem 2rem",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: isMobile ? "2.5rem" : "3rem", margin: 0, fontWeight: "700" }}>ECOVIBE</h1>
        <p style={{ fontSize: isMobile ? "1rem" : "1.25rem", margin: 0, maxWidth: "300px" }}>
          Empowering Sustainable Solutions
        </p>

        <img
          src="/Empower.png"
          alt="Empowering visual"
          style={{
            marginTop: "1rem",
            maxWidth: isMobile ? "100%" : "80%",
            width: "auto",
            height: isMobile ? "auto" : "50%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Right column */}
      <div
        style={{
          width: isMobile ? "100%" : isTablet ? "55%" : "60%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: isMobile ? "2rem 1rem" : "6rem 4rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: isMobile ? "2rem" : "4rem 3rem",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minHeight: isMobile ? "auto" : "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#000000" }}>Log in</h2>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#000000" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=""
                autoComplete="off"
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
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontWeight: 500, color: "#000000" }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 500, color: "#007BFF" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=""
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* reCAPTCHA */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#000000" }}>
                <input type="checkbox" style={{ marginRight: "0.5rem" }} /> I am not a robot
              </label>
            </div>

            {/* Login button + forgot password */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "1rem" }}>
              <button
                type="submit"
                style={{
                  padding: "1rem 2rem",
                  backgroundColor: "#37b137",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s",
                  width: isMobile ? "100%" : "auto",
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
                  width: isMobile ? "100%" : "auto",
                  textAlign: isMobile ? "center" : "left",
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
