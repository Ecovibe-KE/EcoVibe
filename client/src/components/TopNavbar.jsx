// TopNavbar.jsx
import React, { useState, useEffect } from "react";
import { Offcanvas, Container } from "react-bootstrap";
import { NavLink, Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import useBreakpoint from "../hooks/useBreakpoint";
import "../css/TopNavBar.css";

// ✅ Import all sidebar icons
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

function TopNavbar() {
  const [userData, setUserData] = useState({
    name: "Sharon Maina",
    role: "Admin",
    avatar:
      "https://ui-avatars.com/api/?name=Sharon+Maina&background=4e73df&color=fff",
  });

  const [showSidebar, setShowSidebar] = useState(false);
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

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center p-2 rounded mb-1 ${
      isActive ? "active-link" : "inactive-link"
    } text-decoration-none`;

  // Sidebar with safe default for onClose
  const Sidebar = ({ onClose = () => {} }) => (
    <div
      className="vh-100 d-flex flex-column"
      style={{
        width: "280px",
        background: "linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)",
      }}
    >
      {/* Logo */}
      <Container fluid className="p-3 border-bottom">
        <Link to="/home" onClick={onClose}>
          <img
            src="/EcovibeLogo.png"
            alt="EcoVibe Logo"
            className="img-fluid"
            style={{ maxHeight: "60px" }}
          />
        </Link>
      </Container>

      {/* Nav links */}
      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        <NavLink to="/dashboard/main" className={linkClass} onClick={onClose}>
          <img src={home} alt="Home" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/bookings" className={linkClass} onClick={onClose}>
          <img src={bookings} alt="Bookings" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Bookings</span>
        </NavLink>

        <NavLink to="/dashboard/resources" className={linkClass} onClick={onClose}>
          <img src={resources} alt="Resources" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Resource Center</span>
        </NavLink>

        <NavLink to="/dashboard/profile" className={linkClass} onClick={onClose}>
          <img src={profile} alt="Profile" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/dashboard/payments" className={linkClass} onClick={onClose}>
          <img src={payments} alt="Payments" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Payment History</span>
        </NavLink>

        <NavLink to="/dashboard/blog" className={linkClass} onClick={onClose}>
          <img src={blog} alt="Blog" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Blog Management</span>
        </NavLink>

        <NavLink to="/dashboard/services" className={linkClass} onClick={onClose}>
          <img src={services} alt="Services" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Service Management</span>
        </NavLink>

        <NavLink to="/dashboard/about" className={linkClass} onClick={onClose}>
          <img src={about} alt="About Us" className="me-2" style={{ width: 20, height: 20 }} />
          <span>About Us Management</span>
        </NavLink>

        <NavLink to="/dashboard/users" className={linkClass} onClick={onClose}>
          <img src={users} alt="User Management" className="me-2" style={{ width: 20, height: 20 }} />
          <span>User Management</span>
        </NavLink>

        <NavLink to="/dashboard/tickets" className={linkClass} onClick={onClose}>
          <img src={tickets} alt="Tickets" className="me-2" style={{ width: 20, height: 20 }} />
          <span>Tickets</span>
        </NavLink>
      </Container>
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <nav
        className="topbar d-flex justify-content-between align-items-center px-3"
        style={{
          transition: "margin-left 0.3s ease",
          marginLeft: isDesktop ? "280px" : "0px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          height: "60px",
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {!isDesktop && (
            <button
              onClick={() => setShowSidebar(true)}
              className="btn btn-light"
              style={{ width: 40, height: 40, borderRadius: 8 }}
            >
              <FiMenu size={20} />
            </button>
          )}
          <h1 className="fs-5 m-0">Dashboard</h1>
        </div>

        {/* User info */}
        <div className="d-flex align-items-center">
          <img
            src={userData.avatar}
            className="rounded-circle me-2"
            alt="User Avatar"
            style={{ width: 40, height: 40 }}
          />
          <div>
            <span className="fw-bold d-block">{userData.name}</span>
            <span className="text-muted small">{userData.role}</span>
          </div>
        </div>
      </nav>

      {/* Sidebar logic */}
      {isDesktop ? (
        <Sidebar />
      ) : (
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          placement="start"
        >
          <Sidebar onClose={() => setShowSidebar(false)} />
        </Offcanvas>
      )}
    </>
  );
}

export default TopNavbar;
