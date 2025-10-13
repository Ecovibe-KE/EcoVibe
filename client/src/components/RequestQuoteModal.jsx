import React, {useState, useRef, useEffect} from "react";
import {Modal, Button, Form, Alert} from "react-bootstrap";
import Input from "../utils/Input.jsx";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";
import {sendQuoteRequest} from "../api/services/quote.js";

function RequestQuoteModal({show, onHide, service}) {
    const recaptchaRef = useRef();
    const [siteKey, setSiteKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: service.title,
        projectDetails: "",
    });

    const [errors, setErrors] = useState({});

    // Check if reCAPTCHA key is loaded
    useEffect(() => {
        const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
        setSiteKey(key);

        if (!key) {
            toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
        }
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!recaptchaRef.current) {
            toast.error(
                "reCAPTCHA not loaded. Please refresh the page and try again.",
            );
            return;
        }

        setIsSubmitting(true);

        const token =
            typeof recaptchaRef.current.getValue === "function"
                ? recaptchaRef.current.getValue()
                : null;
        if (!token) {
            toast.error("Please complete the reCAPTCHA verification.");
            setIsSubmitting(false);
            return;
        }

        try {
            const quoteData = {
                ...formData,
                service: service,
                timestamp: new Date().toISOString(),
            };

            await sendQuoteRequest(quoteData);
            toast.success(
                "Thank you for your quote request! We will get back to you within 24 hours.",
            );

            // Reset form and close modal
            handleClose();
        } catch (error) {
            toast.error(
                error.message || "There was an error submitting your quote request.",
            );
        } finally {
            if (recaptchaRef.current?.reset) {
                recaptchaRef.current.reset();
            }
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            service: "",
            projectDetails: "",
        });
        setErrors({});
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Request a Quote</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {service && (
                        <Alert variant="info" className="mb-3">
                            <strong>Service:</strong> {service.title}
                        </Alert>
                    )}

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Input
                                type="text"
                                name="name"
                                label="Full Name *"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={errors.name}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Input
                                type="email"
                                name="email"
                                label="Email Address *"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                error={errors.email}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Input
                                type="tel"
                                name="phone"
                                label="Phone Number *"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                error={errors.phone}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Input
                                type="text"
                                name="company"
                                label="Company/Organization"
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <Form.Label>Project Details / Additional Information</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="projectDetails"
                            value={formData.projectDetails}
                            onChange={handleChange}
                            placeholder="Please provide details about your project, requirements, timeline, or any specific needs..."
                        />
                        <Form.Text className="text-muted">
                            The more details you provide, the more accurate our quote will be.
                        </Form.Text>
                    </div>

                    <div className="mb-3">
                        {siteKey ? (
                            <ReCAPTCHA sitekey={siteKey} ref={recaptchaRef}/>
                        ) : (
                            <div className="alert alert-warning">
                                reCAPTCHA is not configured. Please contact Site Owner.
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            backgroundColor: "#37b137",
                            borderColor: "#37b137",
                            fontSize: "1rem",
                            fontWeight: "600",
                        }}
                    >
                        {isSubmitting ? (
                            <>
                <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                ></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send-fill me-2"></i>
                                Submit Quote Request
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default RequestQuoteModal;
