import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout(); //  Clears auth state
    navigate("/login", { replace: true }); //  Redirects to login
  }, [logout, navigate]);

  return null; 
};

export default Logout;
