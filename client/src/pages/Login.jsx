import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 🧪 Mock login logic
    setTimeout(() => {
      if (email === "test@example.com" && password === "123456") {
        onLogin({ name: "Test User", email }); // Pass fake user to parent
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 1000); // simulate network delay
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p style={styles.forgot}>
            <a href="/password-reset" style={styles.link}>
              Forgot Password?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", width: "350px", textAlign: "center" },
  title: { marginBottom: "1rem", color: "#37b137" },
  error: { color: "red", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column" },
  input: { marginBottom: "1rem", padding: "0.8rem", borderRadius: "8px", border: "1px solid #ccc" },
  button: { backgroundColor: "#37b137", color: "white", padding: "0.8rem", border: "none", borderRadius: "8px", cursor: "pointer" },
  forgot: { marginTop: "1rem" },
  link: { color: "#37b137", textDecoration: "none" },
};

export default Login;
