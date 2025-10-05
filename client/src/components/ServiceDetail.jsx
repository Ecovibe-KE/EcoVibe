import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from "../api/services/servicemanagement";
import '../css/ServiceDetail.css';

const ServiceDetail = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const navigate = useNavigate();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchServices = async () => {
            try {
                const response = await getServiceById(id);
                if (response.status === "success") {
                    console.log(response.data)
                    setService(response.data)
                } else {
                    toast.error(`Failed to fetch services: ${response.message}. Please try again later`)
                }
            } catch (error) {
                toast.error(
                    `Failed to fetch service: ${error.response?.data?.message || error.message}`,
                );
            }
        }
        fetchServices()
    }, [id]);

    const handleBookService = () => {
        alert(`Booking ${service.title} - Coming Soon!`);
    };

    const handleBackToServices = () => {
        navigate('/services');
    };

    if (!service) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" role="status" variant="success">
                    <span className="visually-hidden">Loading service...</span>
                </Spinner>
            </Container>
        );
    }

    return (
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
                                        <div className="price-amount">Price: {service.currency} {service.price}</div>
                                        <div className="price-duration">Duration: {service.duration}</div>
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

                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ServiceDetail;