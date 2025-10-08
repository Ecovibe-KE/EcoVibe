import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../api/services/servicemanagement";
import "../css/ServiceDetail.css";
import { displayDuration } from "./admin/ServiceAdminMain";
import BookingForm from "./BookingForm";
import { createBooking } from "../api/services/booking";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { fetchUsers } from "../api/services/usermanagement";

const ServiceDetail = () => {
  const { id } = useParams();
  const { user, isActive, isAtLeastAdmin } = useAuth();
  const [service, setService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user && isActive;
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const response = await getServiceById(id);
        if (response.status === "success") {
          setService(response.data);
        } else {
          toast.error(
            `Failed to fetch service: ${response.message}. Please try again later`,
          );
          setService(null);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          `Server unavailable. Failed to fetch service, please try again later`,
        );
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [id]);

  useEffect(() => {
    const loadClients = async () => {
      if (!isAtLeastAdmin) return;

      try {
        const allUsers = await fetchUsers();
        const activeClients = allUsers.filter(
          (u) => u.role.toUpperCase() === "CLIENT" && !u.is_deleted
        );
        setClients(activeClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      }
    };

    loadClients();
  }, [isAtLeastAdmin]);

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to book a service. Redirecting to Login page");
      setTimeout(() => {
        navigate("/login", { state: { from: `/services/${id}` } });
      }, 3000);
      return;
    }

    setShowBookingModal(true);
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  const handleContact = () => {
    console.log("Contact team clicked");
    // You can implement contact logic here
    toast.info("Contact feature coming soon!");
  };

  const handleBookingSubmit = async (formData) => {
    try {
      console.log("Submitting booking from ServiceDetail:", formData);
      
      // Ensure service_id is included from the current service
      const bookingData = {
        ...formData,
        service_id: service.id // Always use the current service ID
      };

      const response = await createBooking(bookingData);
      console.log("Booking response:", response);
      
      if (response.status === "success") {
        toast.success("Booking created successfully!");
        setShowBookingModal(false);
      } else {
        toast.error(response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking creation error:", error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        "Failed to create booking"
      );
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading service...</span>
        </Spinner>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="no-services-card p-5 bg-light rounded-3 shadow-sm">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <h3 className="text-muted mb-3">Service Unavailable</h3>
            <p className="text-muted mb-4">
              Please check back later or contact us for more information.
            </p>
            <Button
              size="lg"
              className="px-4"
              onClick={handleContact}
              style={{ backgroundColor: "#37b137", borderColor: "#37b137" }}
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <div className="service-detail-fixed">
        <Container>
          <div className="back-button-container">
            <Button
              variant="light"
              onClick={handleBackToServices}
              className="back-btn-fixed"
            >
              <i className="bi bi-arrow-left"></i>
              Back to Services
            </Button>
          </div>

          <Row className="mt-0">
            <Col lg={8}>
              <div className="service-header-fixed">
                <h1 className="service-title-fixed">{service.title}</h1>
              </div>

              <div className="service-image-fixed">
                <img
                  src={service.image}
                  alt={service.title}
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                    e.target.alt = 'Service image not available';
                  }}
                />
              </div>

              <Card className="service-card-fixed">
                <Card.Body>
                  <h5>Service Overview</h5>
                  <p className="service-description-fixed">
                    {service.description}
                  </p>
                </Card.Body>
              </Card>

              <Card className="features-card-fixed">
                <Card.Body>
                  <h5>What's Included</h5>
                  <Row>
                    <Col md={6}>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span>Expert Consultation</span>
                      </div>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span>Customized Solution</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span>Ongoing Support</span>
                      </div>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        <span>Quality Guarantee</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <div className="booking-section-fixed">
                <Card className="booking-card-fixed shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">Book This Service</h4>

                    <div className="price-section-fixed mb-4">
                      <div className="price-amount h5 text-primary">
                        {service.currency} {service.price}
                      </div>
                      <div className="price-duration text-muted">
                        <i className="bi bi-clock me-2"></i>
                        {displayDuration(service.duration)}
                      </div>
                    </div>

                    <div className="booking-features-fixed mb-4">
                      <div className="feature-point mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <span>Dedicated expert</span>
                      </div>
                      <div className="feature-point mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <span>Flexible scheduling</span>
                      </div>
                      <div className="feature-point mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <span>Automatic duration calculation</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="book-now-btn-fixed w-100 py-3"
                      onClick={handleBookService}
                      style={{ 
                        backgroundColor: "#37b137", 
                        borderColor: "#37b137",
                        fontSize: "1.1rem",
                        fontWeight: "600"
                      }}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Book Now
                    </Button>

                    {!isAuthenticated && (
                      <div className="mt-3 text-center">
                        <small className="text-danger">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Please log in to book this service.
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Booking Modal */}
          {showBookingModal && service && (
            <BookingForm
              initialData={{ 
                service_id: service.id,
                // Pre-fill service_id and if admin, no client_id (they'll select)
                // For non-admins, client_id will be auto-set to their ID
              }}
              onSubmit={handleBookingSubmit}
              onClose={() => setShowBookingModal(false)}
              clients={clients}
              services={[service]} // Pass only the current service since it's fixed
              disableService={true} // Disable service selection since we're on a service detail page
            />
          )}
        </Container>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default ServiceDetail;