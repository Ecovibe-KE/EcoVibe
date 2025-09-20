import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { NavLink } from 'react-router-dom';

function NavBar() {
  const size = "lg"
  return (
    <>
      {
        <Navbar expand={size} className="mx-0 mx-md-5 my-2">
          <Container fluid className="d-flex justify-content-between align-items-center flex-nowrap">
            <Navbar.Brand as={NavLink} to="/home">
              <img src="/EcovibeLogo.png" alt="EcoVibe Logo" className="d-inline-block img-fluid" style={{ maxWidth: "250px", height: "auto" }} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${size}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${size}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${size}`}
              placement="end"
            >
              <Offcanvas.Header closeButton>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <Nav.Link as={NavLink} to="/" className="mx-3 fw-bold nav-link">Home</Nav.Link>
                  <Nav.Link as={NavLink} to="/about" className="mx-3 fw-bold nav-link">About</Nav.Link>
                  <Nav.Link as={NavLink} to="/services" className="mx-3 fw-bold nav-link">Services</Nav.Link>
                  <Nav.Link as={NavLink} to="/blog" className="mx-3 fw-bold nav-link">Blog</Nav.Link>
                  <Nav.Link as={NavLink} to="/contact" className="mx-3 fw-bold nav-link">Contact</Nav.Link>
                </Nav>
                <Button as={NavLink} to="/signup" className='my-1 text-white my-custom-button'>Get Started</Button>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      }
    </>
  );
}

export default NavBar;
