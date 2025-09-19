import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { NavLink } from 'react-router-dom';

/**
 * Responsive navigation bar component for the site.
 *
 * Renders a Bootstrap Navbar that expands at the "lg" breakpoint and uses an offcanvas menu on smaller viewports.
 * Displays the site logo ("/EcovibeLogo.png", alt "EcoVibe Logo") as a brand link to "/home", primary navigation links to
 * "/", "/about", "/services", "/blog", and "/contact", and a "Get Started" button linking to "/signup". The offcanvas panel
 * is placed on the right ("end") and is toggled via the Navbar.Toggle control.
 *
 * @return {JSX.Element} The NavBar React element.
 */
function NavBar() {
    const size = "lg"
    return (
        <>
            {
                <Navbar expand={size} className="mx-5 mb-3">
                    <Container fluid>
                        <Navbar.Brand as={NavLink} to="/home"><img src="/EcovibeLogo.png" alt="EcoVibe Logo" width="250" height="70" className="d-inline-block" /></Navbar.Brand>
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