import React from "react";
import { Container } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import "../css/Footer.css";

const footerStyle = {
  backgroundColor: "#ffffff",
  padding: "2rem 1rem",
  marginTop: "auto",
  width: "100%",
};

const topRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "1rem",
  width: "100%",
};

const logoStyle = {
  maxWidth: "180px",
};

const navLinksContainer = {
  display: "flex",
  gap: "2rem",
  fontWeight: "500",
  flexWrap: "wrap",
  flexGrow: 1,
  justifyContent: "center",
};

const socialIconsContainer = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.5rem",
};

const hrStyle = {
  border: "none",
  borderTop: "2px solid #37b137",
  margin: "1rem 0",
};

const bottomRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  fontSize: "0.9rem",
  gap: "1rem",
  width: "100%",
};

const legalLinksContainer = {
  display: "flex",
  gap: "1.5rem",
  flexWrap: "wrap",
};

const legalLinkStyle = {
  textDecoration: "none",
  color: "#37b137",
};

const Footer = ({ pageType }) => {
  const isLandingFooter =
    ["landing", "blog", "services", "about", "contact"].includes(pageType);

  if (!isLandingFooter) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <Container fluid className="p-0">
        {/* Top Row */}
        <div style={topRowStyle}>
          {/* Logo */}
          <img src="/EcovibeLogo.png" alt="EcoVibe Logo" style={logoStyle} />

          {/* Nav Links */}
          <div style={navLinksContainer}>
            <a href="/about" className="nav-link">Quick Links</a>
            <a href="/blog" className="nav-link">Blogs</a>
            <a href="/login" className="nav-link">Login</a>
          </div>

          {/* Social Icons */}
          <div style={socialIconsContainer}>
            <a
              href="https://www.instagram.com/ecovibekenya/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={20} color="black" />
            </a>
            <a
              href="https://www.linkedin.com/company/ecovibe-kenya/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} color="black" />
            </a>
          </div>
        </div>

        {/* Green Line */}
        <hr style={hrStyle} />

        {/* Bottom Row */}
        <div style={bottomRowStyle}>
          <small style={{ color: "#37b137" }}>
            © {currentYear} EcoVibe Kenya. All rights reserved.
          </small>

          <div style={legalLinksContainer}>
            <a href="/privacy-policy" className="legal-link" style={legalLinkStyle}>
              Privacy Policy
            </a>
            <a href="/terms" className="legal-link" style={legalLinkStyle}>
              Terms and Conditions
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
