import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

// Inline styles to avoid missing CSS file
const footerStyle = {
  backgroundColor: "#d6f5d6", // light green
  color: "black",
  padding: "1.5rem 0",
  marginTop: "3rem",
};

const socialIconStyle = {
  color: "black",
  marginRight: "0.75rem",
};

const buttonStyle = {
  color: "white",
  backgroundColor: "#37b137",
  borderColor: "#37b137",
  marginBottom: "0.5rem",
};

const buttonHoverStyle = {
  color: "#37b137",
  backgroundColor: "white",
  borderColor: "#37b137",
};

const Footer = ({ pageType }) => {
  return (
    <footer style={footerStyle}>
      <Container>
        <Row className="text-center text-md-start">
        {/* ECK LOGO */}
          <Col md={3} className="mb-3">
            <img
              src="/EcovibeLogo.png"
              alt="EcoVibe Logo"
              className="img-fluid mb-2"
            />
          </Col>

          {pageType === "landing" && (
            <>
              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Quick Links</h6>
                <ul className="list-unstyled">
                  <li>
                    <a href="/about"className="nav-link">About Us</a>
                  </li>
                  <li>
                    <a href="/services" className="nav-link">Services</a>
                  </li>
                  <li>
                    <a href="/contact" className="nav-link">Contact</a>
                  </li>
                </ul>
              </Col>
{/* Blog */}
              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Blogs</h6>
                <ul className="list-unstyled">
                  <li>
                    <a href="/blog" className="nav-link">Latest Posts</a>
                  </li>
                  <li>
                    <a href="/blog/categories" className="nav-link">Categories</a>
                  </li>
                </ul>
              </Col>

              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Join Us</h6>
                <Button
                  style={buttonStyle}
                  size="sm"
                  href="/login"
                  onMouseOver={e => Object.assign(e.target.style, buttonHoverStyle)}
                  onMouseOut={e => Object.assign(e.target.style, buttonStyle)}
                >
                  Login
                </Button>
                <div>
                  <a
                    href="https://www.linkedin.com/company/ecovibe-kenya/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialIconStyle}
                  >
                    <FaInstagram size={20} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/ecovibe-ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "black" }}
                  >
                    <FaLinkedin size={20} />
                  </a>
                </div>
              </Col>
            </>
          )}

          {pageType === "client" && (
            <>
              <Col md={6} className="mb-3">
                <h6 className="text-uppercase fw-bold">Legal & Policy</h6>
                <ul className="list-unstyled">
                  <li>
                    <a href="/refund-policy" className="nav-link">Refund / Cancellation Policy</a>
                  </li>
                  <li>
                    <a href="/privacy-policy" className="nav-link">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms" className="nav-link">Terms & Conditions</a>
                  </li>
                </ul>
              </Col>

              <Col md={3} className="mb-3 text-center text-md-start">
                <h6 className="text-uppercase fw-bold">Follow Us</h6>
                <a
                  href="https://www.instagram.com/ecovibe"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialIconStyle}
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/company/ecovibe-ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "black" }}
                >
                  <FaLinkedin size={20} />
                </a>
              </Col>
            </>
          )}
        </Row>

        <div className="text-center mt-3">
          <small>&copy; 2025 Ecovibe Kenya. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
