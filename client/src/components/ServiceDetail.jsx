import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../api/services/servicemanagement";
import "../css/ServiceDetail.css";
import { toast, ToastContainer } from "react-toastify";
import RequestQuoteModal from "./RequestQuoteModal.jsx";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [showRequestQuoteModal, setShowRequestQuoteModal] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const handleRequestQuote = (service = null) => {
    setService(service);
    setShowRequestQuoteModal(true);
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  const handleContact = () => {
    console.log("Contact team clicked");
    // You can implement contact logic here
    toast.info("Contact feature coming soon!");
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
              style={{
                backgroundColor: "#37b137",
                borderColor: "#37b137",
              }}
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
                    e.currentTarget.onerror = null;
                    e.target.src = "/api/placeholder/600/400";
                    e.target.alt = "Service image not available";
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
                      onClick={() => handleRequestQuote(service)}
                      style={{
                        backgroundColor: "#37b137",
                        borderColor: "#37b137",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Request a Quote
                    </Button>

                    <RequestQuoteModal
                      show={showRequestQuoteModal}
                      onHide={() => setShowRequestQuoteModal(false)}
                      service={service}
                    />
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
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