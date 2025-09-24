import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for backend API call
    console.log("Password reset link sent to:", email);
  };

  return (
    <div className="d-flex vh-100">
      {/* Left Section */}
      <div className="d-flex flex-column justify-content-center align-items-center flex-1 bg-dark text-white p-5">
        <h1>ECOVIBE</h1>
        <p>Empowering Sustainable Solutions</p>
        <img
          src="/Empower.png"
          alt="EcoVibe Illustration"
          className="img-fluid mt-3"
          style={{ maxHeight: "300px" }}
        />
      </div>

      {/* Right Section */}
      <div className="d-flex flex-column justify-content-center align-items-center flex-1 p-5">
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <h2 className="mb-4">Forgot Password</h2>
          <p>Enter your email to receive a password reset link.</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Send Reset Link
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
