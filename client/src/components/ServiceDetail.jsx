import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../api/services/servicemanagement";
import "../css/ServiceDetail.css";
import { displayDuration } from "./admin/ServiceAdminMain";
import BookingForm from "./BookingForm"; // Add this import
import { createBooking } from "../api/services/booking";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false); // Add this state
  const [, setServices] = useState([]); // Add this state
  const { user, isActive } = useAuth();
  const isAuthenticated = !!user && isActive;
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchServices = async () => {
      try {
        const response = await getServiceById(id);
        if (response.status === "success") {
          setService(response.data);
          // Set services array with the single service for the booking form
          setServices([response.data]);
        } else {
          toast.error(
            `Failed to fetch services: ${response.message}. Please try again later`,
          );
        }
      } catch (error) {
        console.error(error);
        toast.error(
          `Server unavailable. Failed to fetch service, please try again later`,
        );
        setService([]);
      }
    };
    fetchServices();
  }, [id]);

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error(
        "You must be logged in to book a service. Redirecting to Login page",
      );
      setTimeout(() => {
        navigate("/login", { state: { from: `/services/${id}` } });
      }, 5000);
      return;
    }

    setShowBookingModal(true);
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  const handleContact = () => {
    // Add your contact logic here
    console.log("Contact team clicked");
  };

  // Handle booking submission from the modal
  const handleBookingSubmit = async (formData) => {
    try {
      // Since the service is pre-filled and disabled, we can use the createBooking function
      const response = await createBooking(formData);
      if (response.status === "success") {
        toast.success("Booking created successfully!");
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error("Booking creation error:", error);
      toast.error("Failed to create booking");
    }
  };

  if (!service) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading service...</span>
        </Spinner>
      </Container>
    );
  } else if (Array.isArray(service) && service.length === 0) {
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
          {/* Back Button at the absolute top */}
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
            {/* Left Column - Service Details */}
            <Col lg={8}>
              {/* Service Header - Right after back button */}
              <div className="service-header-fixed">
                <h1 className="service-title-fixed">{service.title}</h1>
              </div>

              {/* Service Image */}
              <div className="service-image-fixed">
                <img
                  src={service.image}
                  alt={service.title}
                  className="img-fluid"
                />
              </div>

              {/* Service Description */}
              <Card className="service-card-fixed">
                <Card.Body>
                  <h5>Service Overview</h5>
                  <p className="service-description-fixed">
                    {service.description}
                  </p>
                </Card.Body>
              </Card>

              {/* Service Features */}
              <Card className="features-card-fixed">
                <Card.Body>
                  <h5>What's Included</h5>
                  <Row>
                    <Col md={6}>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Expert Consultation</span>
                      </div>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Customized Solution</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Ongoing Support</span>
                      </div>
                      <div className="feature-item-fixed">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Quality Guarantee</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column - Booking Card */}
            <Col lg={4}>
              <div className="booking-section-fixed">
                <Card className="booking-card-fixed">
                  <Card.Body>
                    <h4>Book This Service</h4>

                    <div className="price-section-fixed">
                      <div className="price-amount">
                        Price: {service.currency} {service.price}
                      </div>
                      <div className="price-duration">
                        Duration: {displayDuration(service.duration)}
                      </div>
                    </div>

                    <div className="booking-features-fixed">
                      <div className="feature-point">
                        <i className="bi bi-check"></i>
                        <span>Dedicated expert</span>
                      </div>
                      <div className="feature-point">
                        <i className="bi bi-check"></i>
                        <span>Flexible scheduling</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="book-now-btn-fixed"
                      onClick={handleBookService}
                    >
                      Book Now
                    </Button>

                    {!isAuthenticated && (
                      <div className="mt-2 small text-danger">
                        Please log in to book this service.
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
              initialData={{ service_id: service.id }}
              onSubmit={handleBookingSubmit}
              onClose={() => setShowBookingModal(false)}
              // clients={[]} // Empty for non-admin users
              services={[service]}
              disableService={true} // Add this prop to disable service selection
            />
          )}
        </Container>
      </div>
      <ToastContainer />
    </>
  );
};

export default ServiceDetail;
