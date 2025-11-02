import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "../utils/Button";
import { verifyAccount, resendVerification } from "../api/services/auth";
import { toast } from "react-toastify";

function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

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

  const handleResend = async () => {
    if (!email) {
      toast.error("No email found for resend.");
      return;
    }
    try {
      const res = await resendVerification(email);
      if (res.status === "success") {
        toast.success(res.message || "Activation link resent!");
      } else {
        toast.error(res.message || "Failed to resend activation link.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to resend activation link ❌");
    }
  };

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

          <Button onClick={() => navigate("/login")} variant="success">
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

          {/* 👇 Always visible option */}
          <p>
            Didn’t work?{" "}
            <Button
              onClick={handleResend}
              variant="outline-primary"
              className="btn-sm"
            >
              Resend account activation link
            </Button>
          </p>
        </>
      )}
    </div>
  );
}

export default VerifyPage;
