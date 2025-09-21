import React from 'react';
import { Container } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import '../css/NavPanel.css';
import home from '../assets/home.png';
import bookings from '../assets/bookings.png';
import profile from '../assets/profile.png';
import resources from '../assets/resources.png';
import payments from '../assets/payment.png';
import blog from '../assets/blog.png';
import services from '../assets/services.png';
import about from '../assets/about.png';
import users from '../assets/users.png';
import tickets from '../assets/tickets.png';

const NavPanel = () => {
  const location = useLocation();

  const isDashboardActive =
    location.pathname === '/' || location.pathname === '/dashboard';

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center p-2 rounded mb-1 ${
      isActive ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
    } text-decoration-none`;

  return (
    <div
      className="vh-100 border-end d-flex flex-column"
      style={{
        width: '280px',
        background: 'linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)',
      }}
    >
      {/* Header */}
      <Container fluid className="p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center">
          <img
            src="/EcovibeLogo.png"
            alt="EcoVibe Logo"
            className="img-fluid"
            style={{ maxHeight: '60px' }}
          />
        </div>
      </Container>

      {/* Navigation Links */}
      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        {/* Main Section */}
        <div className="mb-3">
          <h6
            className="text-muted fw-bold text-uppercase mb-2"
            style={{ fontSize: '14px', letterSpacing: '0.5px' }}
          >
            MAIN
          </h6>
          <NavLink
            to="/dashboard"
            className={`d-flex align-items-center p-2 rounded mb-1 ${
              isDashboardActive
                ? 'custom-text bg-opacity-15 text-warning'
                : 'text-dark'
            } text-decoration-none`}
            style={{ fontSize: '15px' }}
          >
            <img
              src={home}
              alt="Home"
              className="me-2"
              style={{ width: '18px', height: '18px' }}
            />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Management Modules */}
        <div>
          <h6
            className="text-muted fw-bold text-uppercase mb-2"
            style={{ fontSize: '15px', letterSpacing: '0.5px' }}
          >
            MANAGEMENT MODULES
          </h6>

          <NavLink to="/bookings" className={linkClass}>
            <img src={bookings} alt="Bookings" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Bookings</span>
          </NavLink>

          <NavLink to="/resources" className={linkClass}>
            <img src={resources} alt="Resources" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Resource Center</span>
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            <img src={profile} alt="Profile" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/payments" className={linkClass}>
            <img src={payments} alt="Payments" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Payment History</span>
          </NavLink>

          <NavLink to="/blog" className={linkClass}>
            <img src={blog} alt="Blog" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Blog Management</span>
          </NavLink>

          <NavLink to="/services" className={linkClass}>
            <img src={services} alt="Services" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Service Management</span>
          </NavLink>

          <NavLink to="/about" className={linkClass}>
            <img src={about} alt="About Us" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>About Us Management</span>
          </NavLink>

          <NavLink to="/users" className={linkClass}>
            <img src={users} alt="User Management" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>User Management</span>
          </NavLink>

          <NavLink to="/tickets" className={linkClass}>
            <img src={tickets} alt="Tickets" className="me-3" style={{ width: '20px', height: '20px' }} />
            <span>Tickets</span>
          </NavLink>
        </div>
      </Container>
    </div>
  );
};

export default NavPanel;
