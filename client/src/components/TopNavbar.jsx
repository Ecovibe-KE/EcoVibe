import React, { useState, useEffect, useCallback } from "react";
import { Offcanvas, Container, Dropdown } from "react-bootstrap";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import useBreakpoint from "../hooks/useBreakpoint";
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
import { toast } from "react-toastify";

import "../css/TopNavBar.css";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_WIDTH = 280;


const NAV_ITEMS = [
  { to: "/dashboard/main", 
    icon: home, 
    label: "Dashboard", 
    alt: "Home" },
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

// Client-side UI filtering only—does not enforce security.
// All protected endpoints must verify roles server-side.
const CLIENT_ALLOWED_ROUTES = [
  "/dashboard/bookings",
  "/dashboard/resources",
  "/dashboard/profile",
  "/dashboard/payments",
  "/dashboard/tickets",
];

function TopNavbar() {
  const { user, isAtLeastAdmin, logoutUser } = useAuth();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isDesktop = useBreakpoint("lg");
  const navigate = useNavigate();


  // Close mobile sidebar on desktop
  useEffect(() => {
    if (isDesktop && showMobileSidebar) {
      setShowMobileSidebar(false);
    }
  }, [isDesktop, showMobileSidebar]);

  const toggleMobileSidebar = useCallback(
    () => setShowMobileSidebar((prev) => !prev),
    [],
  );
  const closeMobileSidebar = useCallback(() => setShowMobileSidebar(false), []);

  const getLinkClass = ({ isActive }) =>
    `d-flex align-items-center p-2 rounded mb-1 text-decoration-none ${
      isActive ? "active-link" : "inactive-link"
    }`;


 const SidebarContent = ({ onClose, isMobile = false }) => {
  const filteredItems = isAtLeastAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => CLIENT_ALLOWED_ROUTES.includes(item.to));

    return (
      <div
        className="sidebar-content h-100 d-flex flex-column"
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          background: "linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)",
        }}
      >
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

            {filteredItems
              .filter((item) => item.to !== "/dashboard/main")
              .map((item) => (
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
  };

  return (
    <>
      {/* Desktop Sidebar */}
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
                src={user?.avatar}
                className="user-avatar rounded-circle"
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
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#5a5c69",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  className="user-role"
                  style={{ fontSize: "0.8rem", color: "#858796" }}
                >
                  {user?.role}
                </div>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={async () => {
                  try {
                      const refreshToken = localStorage.getItem("refreshToken");
                      if (refreshToken) {
                        await logoutUser(refreshToken); // call backend to invalidate
                      }
                  } catch (err) {
                    console.error("Logout API failed:", err);
                    toast.error("Logout failed, please try again");
                  } finally {
                    localStorage.removeItem("user");
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login"; // redirect to login
                  }
                }}
                style={{
                  backgroundColor: "#28a745",
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fd7e14")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#28a745")
                }
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Offcanvas
        show={showMobileSidebar && !isDesktop}
        onHide={closeMobileSidebar}
        placement="start"
        backdrop
        scroll={false}
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
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