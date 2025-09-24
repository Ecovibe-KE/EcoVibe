import React, { useState } from "react";
import { Button, Offcanvas, Container } from "react-bootstrap";
import { NavLink, Link } from "react-router-dom";
import useBreakpoint from "../hooks/useBreakpoint"; //hook to detect screen size

import "../css/NavPanel.css";
import home from "../assets/home.png";
import bookings from "../assets/bookings.png";
import profile from "../assets/profile.png";
import resources from "../assets/resources.png";
import payments from "../assets/payment.png";
import blog from "../assets/blog.png";
import services from "../assets/services.png";
import about from "../assets/about.png";
import users from "../assets/users.png";
import tickets from "../assets/tickets.png";

const NavPanel = () => {
  const [show, setShow] = useState(false);
  const isDesktop = useBreakpoint("lg");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center p-2 rounded mb-1 ${
      isActive ? "active-link" : "inactive-link"
    } text-decoration-none `;

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "h-100" : "vh-100"} ${
        isMobile ? "" : "border-end"
      } d-flex flex-column`}
      style={{
        width: "280px",
        background: "linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <Container fluid className="p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center">
          <Link to="/home" onClick={isMobile ? handleClose : undefined}>
            <img
              src="/EcovibeLogo.png"
              alt="EcoVibe Logo"
              className="img-fluid"
              style={{ maxHeight: "60px" }}
            />
          </Link>
        </div>
      </Container>

      {/* Navigation Links */}
      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        {/* Main Section */}
        <div className="mb-4">
          <h6
            className="text-muted fw-bold text-uppercase mb-2"
            style={{ fontSize: "13px", letterSpacing: "0.5px" }}
          >
            Main
          </h6>
          <NavLink
            to="/dashboard/main"
            className={linkClass}
            style={{ fontSize: "15px" }}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={home}
              alt="Home"
              className="me-2"
              style={{ width: "18px", height: "18px" }}
            />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Management Modules */}
        <div>
          <h6
            className="text-muted fw-bold text-uppercase mb-2"
            style={{ fontSize: "13px", letterSpacing: "0.5px" }}
          >
            Management Modules
          </h6>

          <NavLink
            to="/dashboard/bookings"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={bookings}
              alt="Bookings"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Bookings</span>
          </NavLink>

          <NavLink
            to="/dashboard/resources"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={resources}
              alt="Resources"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Resource Center</span>
          </NavLink>

          <NavLink
            to="/dashboard/profile"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={profile}
              alt="Profile"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/dashboard/payments"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={payments}
              alt="Payments"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Payment History</span>
          </NavLink>

          <NavLink
            to="/dashboard/blog"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={blog}
              alt="Blog"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Blog Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/services"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={services}
              alt="Services"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Service Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/about"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={about}
              alt="About Us"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>About Us Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/users"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={users}
              alt="Users"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>User Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/tickets"
            className={linkClass}
            onClick={isMobile ? handleClose : undefined}
          >
            <img
              src={tickets}
              alt="Tickets"
              className="me-3"
              style={{ width: 20, height: 20 }}
            />
            <span>Tickets</span>
          </NavLink>
        </div>
      </Container>
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <SidebarContent />
      ) : (
        <>
          {/* Mobile hamburger toggle button */}
          {!show && (
            <Button
              variant="light"
              onClick={handleShow}
              className="d-lg-none position-fixed shadow-sm"
              aria-label="Open navigation menu"
              aria-controls="navpanel-offcanvas"
              aria-expanded={show}
              style={{
                top: "75px",
                left: "15px",
                zIndex: 1050,
                width: "45px",
                height: "45px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(245, 230, 211, 0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "20px",
                  height: "20px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "2px",
                    backgroundColor: "#333",
                    margin: "2px 0",
                  }}
                />
                <div
                  style={{
                    width: "18px",
                    height: "2px",
                    backgroundColor: "#333",
                    margin: "2px 0",
                  }}
                />
                <div
                  style={{
                    width: "18px",
                    height: "2px",
                    backgroundColor: "#333",
                    margin: "2px 0",
                  }}
                />
              </div>
            </Button>
          )}

          {/* Offcanvas sliding panel */}
          <Offcanvas
            id="navpanel-offcanvas"
            show={show}
            onHide={handleClose}
            placement="start"
            backdrop={true}
            scroll={false}
            style={{ width: "280px" }}
          >
            <SidebarContent isMobile={true} />
          </Offcanvas>

          {/* Spacer to prevent overlap */}
          <div
            style={{ marginLeft: "70px", marginTop: "20px" }}
            className="d-lg-none"
          />
        </>
      )}
    </>
  );
};

export default NavPanel;