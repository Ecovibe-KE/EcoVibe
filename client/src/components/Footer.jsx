import React from "react";
import { Container } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import "../css/Footer.css";
import { NavLink } from "react-router-dom";



const Footer = ({ pageType }) => {
  const isLandingFooter =
    ["landing", "blog", "services", "about", "contact"].includes(pageType);

  if (!isLandingFooter) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <Container>
        {/* Top Row */}
        <div style={topRowStyle}>
          {/* Logo */}
          <img
            src="/EcovibeLogo.png"
            alt="EcoVibe Logo"
            style={logoStyle}
          />

          {/* Nav Links */}
          <div style={navLinksContainer}>
            <NavLink to="/about" className="nav-link">Quick Links</NavLink>
            <NavLink to="/blog" className="nav-link">Blogs</NavLink>
            <NavLink to="/login" className="nav-link">Login</NavLink>
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
          <p style={{ 
            color: "#37b137",fontSize: "1rem", fontWeight: "600"
             }}>
            © {currentYear} EcoVibe Kenya. All rights reserved.
          </p>

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
