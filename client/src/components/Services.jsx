import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "../css/Services.css";
import { useNavigate } from "react-router-dom";
import { getServices } from "../api/services/servicemanagement";

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        if (response.status === "success") {
          // Get only active services
          const activeServices = response.data.filter(
            (service) => service.status.toLowerCase() === "active",
          );
          activeServices.length === 0;
          setServices(activeServices);
        } else {
          toast.error(`Failed to fetch services: ${response.message}.`);
        }
      } catch (error) {
        console.error(error)
        toast.error(`Server unavailable. Please try again later`);
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  const handleLearnMore = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const handleContact = () => {
    navigate("/contact");
  };

  const approachSteps = [
    {
      id: 1,
      title: "Assessment & Analysis",
      description:
        "We begin with a comprehensive analysis of your current ESG performance and identify key areas for improvement.",
    },
    {
      id: 2,
      title: "Strategy Development",
      description:
        "We co-create a tailored ESG strategy aligned with your business objectives and stakeholder expectations.",
    },
    {
      id: 3,
      title: "Implementation Support",
      description:
        "We provide hands-on support to implement initiatives, ensuring effective execution and change management.",
    },
  ];

  if (!services) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading service...</span>
        </Spinner>
      </Container>
    );
  } else if (Array.isArray(services) && services.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="no-services-card p-5 bg-light rounded-3 shadow-sm">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <h3 className="text-muted mb-3">No Services Available</h3>
            <p className="text-muted mb-4">
              We're currently updating our service offerings. Please check back
              later or contact us for more information.
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
      <div className="services-section">
        {/* Hero Section */}
        <section className="pt-5 pb-3 bg-light">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <h1 className="mb-5 fw-semibold display-6 service-underline">
                  Our Sustainable Services
                </h1>
                <p className="lead fw-semibold">
                  At Ecovibe Kenya, we provide comprehensive ESG (Environmental,
                  Social, and Governance) consultancy services tailored to help
                  your organization thrive in the evolving sustainability
                  landscape.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Services Grid Section */}
        <section className="services-grid py-3 bg-light">
          <Container>
            <Row className="g-4">
              {services
                .filter((service) => service.status.toLowerCase() === "active")
                .map((service) => (
                  <Col key={service.id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 service-card">
                      {/* Service Image */}
                      <div className="service-image-container">
                        <Card.Img
                          variant="top"
                          src={service.image}
                          alt={service.title}
                          className="service-img"
                        />
                      </div>
                      <Card.Body className="p-4 d-flex flex-column">
                        <Card.Title
                          className="fw-bold mb-3"
                          style={{ color: "#37b137" }}
                        >
                          {service.title}
                        </Card.Title>
                        <Card.Text className="text-muted mb-4 flex-grow-1">
                          {service.description}
                        </Card.Text>
                        <div className="mt-auto">
                          <Button
                            className="learn-more-btn"
                            style={{
                              backgroundColor: "#37b137",
                              borderColor: "#37b137",
                              width: "100%",
                            }}
                            onClick={() => handleLearnMore(service.id)}
                          >
                            Learn More
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Container>
        </section>

        {/* Approach Section */}
        <section className="approach-section py-3">
          <Container>
            <Row className="justify-content-center mb-5">
              <Col lg={8} className="text-center">
                <h2 className="fw-semibold display-6 service-underline">
                  Our Approach
                </h2>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col lg={10}>
                <Row className="align-items-center">
                  <Col lg={6} className="mb-4 mb-lg-0">
                    <h4 className="text-dark mb-4">
                      Tailored Sustainable Solutions
                    </h4>
                    <p className="text-muted mb-4">
                      At Ecovibe Kenya, we understand that each organization has
                      unique sustainability challenges and opportunities. Our
                      approach is customized to your specific context, industry,
                      and goals. We combine global best practices with local
                      insights to develop practical, implementable strategies
                      that drive meaningful change while delivering business
                      value. Our team stays at the forefront of the evolving ESG
                      landscape, ensuring that our clients are always ahead of
                      regulatory changes and market expectations.
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
                  </Col>
                  <Col lg={6}>
                    <div className="approach-steps">
                      {approachSteps.map((step, index) => (
                        <div key={step.id} className="approach-step mb-4">
                          <div className="d-flex align-items-start">
                            <div
                              className="step-number text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ backgroundColor: "#37b137" }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="fw-bold text-dark mb-2">
                                {step.title}
                              </h5>
                              <p className="text-muted mb-0">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
      <ToastContainer />
    </>
  );
};

export default Services;
