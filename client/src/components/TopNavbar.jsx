// TopNavbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Offcanvas, Container } from "react-bootstrap";
import { NavLink, Link, Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import useBreakpoint from "../hooks/useBreakpoint";
import "../css/TopNavBar.css";
import home from "../assets/home.png";
import bookings from "../assets/bookings.png";
import resources from "../assets/resources.png";
import profile from "../assets/profile.png";
import payments from "../assets/payment.png";
import blog from "../assets/blog.png";
import services from "../assets/services.png";
import about from "../assets/about.png";
import users from "../assets/users.png";
import tickets from "../assets/tickets.png";

const SIDEBAR_WIDTH = 280;

const NAV_ITEMS = [
  { to: "/dashboard/main", icon: home, label: "Dashboard", alt: "Home" },
  {
    to: "/dashboard/bookings",
    icon: bookings,
    label: "Bookings",
    alt: "Bookings",
  },
  {
    to: "/dashboard/resources",
    icon: resources,
    label: "Resource Center",
    alt: "Resources",
  },
  { to: "/dashboard/profile", icon: profile, label: "Profile", alt: "Profile" },
  {
    to: "/dashboard/payments",
    icon: payments,
    label: "Payment History",
    alt: "Payments",
  },
  { to: "/dashboard/blog", icon: blog, label: "Blog Management", alt: "Blog" },
  {
    to: "/dashboard/services",
    icon: services,
    label: "Service Management",
    alt: "Services",
  },
  {
    to: "/dashboard/about",
    icon: about,
    label: "About Us Management",
    alt: "About Us",
  },
  {
    to: "/dashboard/users",
    icon: users,
    label: "User Management",
    alt: "User Management",
  },
  { to: "/dashboard/tickets", icon: tickets, label: "Tickets", alt: "Tickets" },
];

function TopNavbar() {
  const [userData, setUserData] = useState({
    name: "Sharon Maina",
    role: "Admin",
    avatar:
      "https://ui-avatars.com/api/?name=Sharon+Maina&background=4e73df&color=fff",
  });

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isDesktop = useBreakpoint("lg");

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

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (isDesktop && showMobileSidebar) {
      setShowMobileSidebar(false);
    }
  }, [isDesktop, showMobileSidebar]);

  const toggleMobileSidebar = useCallback(() => {
    setShowMobileSidebar((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setShowMobileSidebar(false);
  }, []);

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
      {/* Header */}
      <Container fluid className="p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between">
          <Link
            to="/home"
            onClick={isMobile ? onClose : undefined}
            className="logo-link"
          >
            <img
              src="/EcovibeLogo.png"
              alt="EcoVibe Logo"
              className="img-fluid"
              style={{ maxHeight: "60px" }}
            />
          </Link>
          {isMobile && (
            <button
              onClick={onClose}
              className="btn btn-light btn-sm"
              aria-label="Close sidebar"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </Container>

      {/* Navigation Links */}
      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        {/* Main Section */}
        <div className="mb-3">
          <h6
            className="text-muted fw-bold text-uppercase mb-2"
            style={{ fontSize: "14px", letterSpacing: "0.5px" }}
          >
            MAIN
          </h6>
          <NavLink
            to="/dashboard/main"
            className={getLinkClass}
            style={{ fontSize: "15px" }}
            onClick={isMobile ? onClose : undefined}
            end
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
            style={{ fontSize: "15px", letterSpacing: "0.5px" }}
          >
            MANAGEMENT MODULES
          </h6>

          {NAV_ITEMS.slice(1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getLinkClass}
              onClick={isMobile ? onClose : undefined}
              end
            >
              <img
                src={item.icon}
                alt={item.alt}
                className="me-3"
                style={{ width: 20, height: 20 }}
              />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </Container>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      {isDesktop && (
        <div
          className="desktop-sidebar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: `${SIDEBAR_WIDTH}px`,
            zIndex: 1040,
          }}
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
        {/* Left Side */}
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
          <h1
            className="page-title mb-0"
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "#5a5c69" }}
          >
            Dashboard
          </h1>
        </div>

        {/* Right Side - User Info */}
        <div className="user-profile d-flex align-items-center">
          <img
            src={userData.avatar}
            className="user-avatar rounded-circle me-2"
            alt="User Avatar"
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid #e3e6f0",
            }}
          />
          <div className="user-details d-none d-sm-block">
            <div
              className="user-name"
              style={{ fontWeight: 600, fontSize: "0.9rem", color: "#5a5c69" }}
            >
              {userData.name}
            </div>
            <div
              className="user-role"
              style={{ fontSize: "0.8rem", color: "#858796" }}
            >
              {userData.role}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Offcanvas */}
      <Offcanvas
        show={showMobileSidebar && !isDesktop}
        onHide={closeMobileSidebar}
        placement="start"
        backdrop={true}
        scroll={false}
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        <SidebarContent onClose={closeMobileSidebar} isMobile={true} />
      </Offcanvas>

      {/* Main Content Area */}
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
