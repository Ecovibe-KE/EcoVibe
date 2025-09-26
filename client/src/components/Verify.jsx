import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "../utils/Button";
import { verifyAccount } from "../api/services/auth";

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

    verifyAccount(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Account verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
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

          <Button onClick={() => navigate("/login")} color="#f5a030">
            Go to Login
          </Button>
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
