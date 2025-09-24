import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; 
import api from "../api/axiosConfig";

function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token provided");
      return;
    }


    // Save token to localStorage so axiosConfig picks it up
    localStorage.setItem("authToken", token);

    api
      .post("/verify")
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Account verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      });
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "loading" && (
        <p style={{ color: "#37b137", fontWeight: "bold" }}>Verifying…</p>
      )}

      {status === "success" && (
        <>
          <h2 style={{ color: "#37b137", fontWeight: "bold" }}>
            ✅ Account Verified!
          </h2>
          <p style={{ color: "#333" }}>{message}</p>
          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#f5a030",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Go to Login
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <h2 style={{ color: "#f5a030", fontWeight: "bold" }}>
            ❌ Verification Failed
          </h2>
          <p style={{ color: "#333" }}>{message}</p>
        </>
      )}
    </div>
  );
}

export default VerifyPage;
