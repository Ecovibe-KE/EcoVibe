import React from 'react';
import { Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import '../css/App.css';
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

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <div 
      className="vh-100 border-end d-flex flex-column"
      style={{
        width: '280px', 
        background: 'linear-gradient(180deg, #F5E6D3 0%, #E8F5E8 100%)'
      }}
    >
      {/* Header */}
      <Container fluid className="p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center">
          <img 
            src="/EcovibeLogo.png" 
            alt="EcoVibe Logo" 
            className="img-fluid" 
            style={{maxHeight: '60px'}} 
          />
        </div>
      </Container>

      {/* Navigation - Scrollable if needed */}
      <Container fluid className="p-3 flex-grow-1 overflow-auto">
        {/* Main Section */}
        <div className="mb-3">
          <h6 className="text-muted fw-bold text-uppercase mb-2" style={{fontSize: '14px', letterSpacing: '0.5px'}}>
            MAIN
          </h6>
          <Nav className="flex-column">
            <LinkContainer to="/dashboard">
              <Nav.Link 
                className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                  isActive('/dashboard') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
                style={{transition: 'all 0.2s ease', fontSize: '15px'}}
              >
                <img 
                  src={home} 
                  alt="Home" 
                  className="me-2" 
                  style={{width: '18px', height: '18px'}} 
                />
                <span>Dashboard</span>
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </div>

        {/* Management Modules */}
        <div>
          <h6 className="text-muted fw-bold text-uppercase mb-2" style={{fontSize: '15px', letterSpacing: '0.5px'}}>
            MANAGEMENT MODULES
          </h6>
          <Nav className="flex-column">
            
            <LinkContainer to="/bookings">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/bookings') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img 
                  src= {bookings}
                  alt="Bookings" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Bookings</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/resources">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/resources') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img 
                  src={resources}
                  alt="Resources" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Resource Center</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/profile">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/profile') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img 
                  src={profile}
                  alt="Profile" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Profile</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/payments">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/payments') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={payments}
                  alt="Payments" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Payment History</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/blog">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/blog') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={blog}
                  alt="Blog" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Blog Management</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/services">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/services') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={services}
                  alt="Services" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Service Management</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/about">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/about') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={about}
                  alt="About Us" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>About Us Management</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/users">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/users') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={users}
                  alt="User Management" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>User Management</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/tickets">
              <Nav.Link 
                className={`d-flex align-items-center p-2 rounded mb-1 ${
                  isActive('/tickets') ? 'custom-text bg-opacity-15 text-warning' : 'text-dark'
                }`}
              >
                <img
                  src={tickets}
                  alt="Tickets" 
                  className="me-3" 
                  style={{width: '20px', height: '20px'}} 
                />
                <span>Tickets</span>
              </Nav.Link>
            </LinkContainer>

          </Nav>
        </div>
      </Container>
    </div>
  );
};

export default NavPanel;