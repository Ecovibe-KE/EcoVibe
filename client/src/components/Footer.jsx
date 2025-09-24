import React from "react";
import { Container } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import "../css/Footer.css";

const Footer = ({ pageType }) => {
  const isLandingFooter = [
    "landing",
    "blog",
    "services",
    "about",
    "contact",
  ].includes(pageType);

  if (!isLandingFooter) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container fluid className="p-0">
        {/* Top Row */}
        <div className="footer-top-row">
          {/* Logo */}
          <img
            src="/EcovibeLogo.png"
            alt="EcoVibe Logo"
            className="footer-logo"
          />

          {/* Nav Links */}
          <div className="footer-nav-links">
            <a href="/about" className="nav-link">
              Quick Links
            </a>
            <a href="/blog" className="nav-link">
              Blogs
            </a>
            <a href="/login" className="nav-link">
              Login
            </a>
          </div>

          {/* Social Icons */}
          <div className="footer-social-icons">
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
        <hr className="footer-hr" />

        {/* Bottom Row */}
        <div className="footer-bottom-row">
          <small style={{ color: "#37b137" }}>
            © {currentYear} EcoVibe Kenya. All rights reserved.
          </small>
          <div className="footer-legal-links">
            <a href="/privacy-policy" className="legal-link">
              Privacy Policy
            </a>
            <a href="/terms" className="legal-link">
              Terms and Conditions
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
