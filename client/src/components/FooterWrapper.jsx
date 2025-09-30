import { useLocation } from "react-router-dom";
import Footer from "./Footer.jsx";

// Hide footer only on protected/dashboard pages
const FOOTER_EXCLUDE = ["/dashboard"];

export default function FooterWrapper() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  if (FOOTER_EXCLUDE.some((p) => path.startsWith(p))) return null;

  return <Footer pageType="landing" />;
}
