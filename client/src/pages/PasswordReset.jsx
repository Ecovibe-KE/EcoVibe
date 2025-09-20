import React, { useState } from "react";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(""); 

    // 🧪 Mock reset logic
    setTimeout(() => {
      setMessage(`If ${email} exists, a password reset link has been sent.`);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.instruction}>
          Enter your email address to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
  title: { marginBottom: "0.5rem", color: "#37b137" },
  instruction: { marginBottom: "1rem", fontSize: "0.9rem", color: "#333" },
  form: { display: "flex", flexDirection: "column" },
  input: { marginBottom: "1rem", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc" },
  button: { backgroundColor: "#37b137", color: "white", padding: "0.8rem", border: "none", borderRadius: "8px", cursor: "pointer" },
  message: { marginTop: "1rem", color: "#37b137", fontSize: "0.9rem" },
};

export default PasswordReset;
