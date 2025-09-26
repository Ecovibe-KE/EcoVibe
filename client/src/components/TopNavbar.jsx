// TopNavbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Offcanvas, Container, Dropdown } from "react-bootstrap";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import useBreakpoint from "../hooks/useBreakpoint";
import "../css/TopNavBar.css";

const SIDEBAR_WIDTH = 280;

function TopNavbar({ navItems, userData: initialUserData }) {
  const [userData, setUserData] = useState(initialUserData);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isDesktop = useBreakpoint("lg");
  const navigate = useNavigate();

  // Load user data from localStorage if available
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData((prev) => ({ ...prev, ...parsedData }));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Close mobile sidebar on desktop
  useEffect(() => {
    if (isDesktop && showMobileSidebar) {
      setShowMobileSidebar(false);
    }
  }, [isDesktop, showMobileSidebar]);

  const toggleMobileSidebar = useCallback(() => setShowMobileSidebar((prev) => !prev), []);
  const closeMobileSidebar = useCallback(() => setShowMobileSidebar(false), []);

  const getLinkClass = ({ isActive }) =>
    `d-flex align-items-center p-2 rounded mb-1 text-decoration-none ${
      isActive ? "active-link" : "inactive-link"
    }`;

  const SidebarContent = ({ onClose, isMobile = false }) => (
    <div
      className="sidebar-content h-100 d-flex flex-column"
      style={{
        width: `${SIDEBAR_WIDTH}px`,
        background: "linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)",
      }}
    >
      <Container fluid className="p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/home" onClick={isMobile ? onClose : undefined} className="logo-link">
            <img
              src="/EcovibeLogo.png"
              alt="EcoVibe Logo"
              className="img-fluid"
              style={{ maxHeight: "60px" }}
            />
          </Link>
          {isMobile && (
            <button onClick={onClose} className="btn btn-light btn-sm" aria-label="Close sidebar">
              <FiX size={18} />
            </button>
          )}
        </div>
      </Container>

      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={getLinkClass}
            onClick={isMobile ? onClose : undefined}
            end
          >
            {item.icon && <img src={item.icon} alt={item.alt} className="me-2" style={{ width: 20, height: 20 }} />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </Container>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <div
          className="desktop-sidebar"
          style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: `${SIDEBAR_WIDTH}px`, zIndex: 1040 }}
        >
          <SidebarContent />
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav
        className="top-navbar"
        style={{
          position: "fixed",
          top: 0,
          left: isDesktop ? `${SIDEBAR_WIDTH}px` : 0,
          right: 0,
          height: "70px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          transition: "left 0.3s ease",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {!isDesktop && (
            <button
              onClick={toggleMobileSidebar}
              className="btn btn-light"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle sidebar"
            >
              <FiMenu size={20} />
            </button>
          )}
          <h1 className="page-title mb-0" style={{ fontSize: "1.5rem", fontWeight: 600, color: "#5a5c69" }}>
            Dashboard
          </h1>
        </div>

        {/* User Profile with Logout Dropdown */}
        <div className="user-profile d-flex align-items-center">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="dropdown-user"
              className="d-flex align-items-center gap-2"
              style={{ border: "none", background: "transparent" }}
            >
              <img
                src={userData.avatar}
                className="user-avatar rounded-circle"
                alt="User Avatar"
                style={{ width: "40px", height: "40px", border: "2px solid #e3e6f0" }}
              />
              <div className="user-details d-none d-sm-block">
                <div className="user-name" style={{ fontWeight: 600, fontSize: "0.9rem", color: "#5a5c69" }}>
                  {userData.name}
                </div>
                <div className="user-role" style={{ fontSize: "0.8rem", color: "#858796" }}>
                  {userData.role}
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
<Dropdown.Item
  onClick={() => {
    localStorage.removeItem("userData");
    navigate("/login");
  }}
  style={{
    backgroundColor: "#28a745", // green
    color: "#fff",
    fontWeight: 600,
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "4px",
    display: "block",
    width: "100%",
    padding: "10px 15px",
    margin: "0",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd7e14")} // orange on hover
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")} // back to green
>
  Logout
</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Offcanvas show={showMobileSidebar && !isDesktop} onHide={closeMobileSidebar} placement="start" backdrop scroll={false} style={{ width: `${SIDEBAR_WIDTH}px` }}>
        <SidebarContent onClose={closeMobileSidebar} isMobile={true} />
      </Offcanvas>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginLeft: isDesktop ? `${SIDEBAR_WIDTH}px` : 0,
          marginTop: "70px",
          padding: "20px",
          minHeight: "calc(100vh - 70px)",
          backgroundColor: "#f8f9fc",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}

export default TopNavbar;
