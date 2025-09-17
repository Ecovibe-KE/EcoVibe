import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = ({ pageType }) => {
  return (
    <footer className="custom-footer">
      <Container fluid className="p-0">
        <Row className="text-center text-md-start mx-0">
          {/* Logo */}
          <Col md={3} className="mb-3">
            <img
              src="/images/logo.png"
              alt="EcoVibe Logo"
              className="img-fluid mb-2"
            />
          </Col>

          {pageType === "landing" && (
            <>
              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Quick Links</h6>
                <ul className="list-unstyled">
                  <li><a href="/about" className="text-light text-decoration-none">About Us</a></li>
                  <li><a href="/services" className="text-light text-decoration-none">Services</a></li>
                  <li><a href="/contact" className="text-light text-decoration-none">Contact</a></li>
                </ul>
              </Col>

              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Blogs</h6>
                <ul className="list-unstyled">
                  <li><a href="/blog" className="text-light text-decoration-none">Latest Posts</a></li>
                  <li><a href="/blog/categories" className="text-light text-decoration-none">Categories</a></li>
                </ul>
              </Col>

              <Col md={3} className="mb-3">
                <h6 className="text-uppercase fw-bold">Join Us</h6>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="mb-2"
                  href="/login"
                >
                  Login
                </Button>
                <div>
                  <a
                    href="https://www.instagram.com/ecovibe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light me-3"
                  >
                    <FaInstagram size={20} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/ecovibe-ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light"
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
                  <li><a href="/refund-policy" className="text-light text-decoration-none">Refund / Cancellation Policy</a></li>
                  <li><a href="/privacy-policy" className="text-light text-decoration-none">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-light text-decoration-none">Terms & Conditions</a></li>
                </ul>
              </Col>

              <Col md={3} className="mb-3 text-center text-md-start">
                <h6 className="text-uppercase fw-bold">Follow Us</h6>
                <a
                  href="https://www.instagram.com/ecovibe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light me-3"
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/company/ecovibe-ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light"
                >
                  <FaLinkedin size={20} />
                </a>
              </Col>
            </>
          )}
        </Row>

        <Row className="mt-3 mx-0">
          <Col className="text-center">
            <small>&copy; 2025 Ecovibe Kenya. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
