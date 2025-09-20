import React, {useState, useRef, useEffect} from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReCAPTCHA from "react-google-recaptcha";

function Contact() {
    const recaptchaRef = useRef();
    const [siteKey, setSiteKey] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        email: '',
        phone: '',
        message: ''
    });

    // Check if reCAPTCHA key is loaded
    useEffect(() => {
        const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
        setSiteKey(key);
        console.log("reCAPTCHA Site Key:", key ? "Loaded" : "Missing");

        if (!key) {
            toast.error('reCAPTCHA site key is missing. Please contact Site Owner.');
        }
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaRef.current) {
            toast.error('reCAPTCHA not loaded. Please refresh the page and try again.');
            return;
        }

        try {
            // TODO: VALENTINE HANDLE BACKEND LOGIC
            console.log('Form submitted:', formData);
                // toast.success('Thank you for your message! We will get back to you within 24 hours.');

            const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/contact`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Thank you for your message! We will get back to you within 24 hours.');
            } else {
                toast.error(result.message || 'There was an error submitting your form.');
            }
            // Reset form and reCAPTCHA
            setFormData({
                name: '',
                industry: '',
                email: '',
                phone: '',
                message: ''
            });
            recaptchaRef.current.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred. Please try again.');
            // Reset form and reCAPTCHA
            setFormData({
                name: '',
                industry: '',
                email: '',
                phone: '',
                message: ''
            });
            recaptchaRef.current.reset();
        }
    };

    return (
        <div>
            <div className="container">
                <div className="container my-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold mb-3" style={{color: "#535353"}}>
                            Ready to Transform Your way with ECK?
                        </h1>
                        <p className="lead mx-auto" style={{maxWidth: "800px"}}>
                            Let's discuss how our cutting-edge solutions can help your
                            organization stay ahead in the evolving ESG landscape. Get in
                            touch with our expert team today.
                        </p>
                    </div>
                </div>
                <div className="row g-5">
                    <div className="col-lg-7">
                        <div className="mb-4">
                            <div className="card shadow-sm h-100" style={{backgroundColor: "#F9F9F9"}}>
                                <div className="card-body ">
                                    <h2 className="card-title mb-3">Send Us a Message</h2>
                                    <p className="card-text text-muted mb-4">
                                        Fill out the form below and we'll get back to you within 24 hours.
                                    </p>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    label="Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="industry" className="form-label">Industry</label>
                                                    <select
                                                        id="industry"
                                                        name="industry"
                                                        value={formData.industry}
                                                        onChange={handleChange}
                                                        className="form-select"
                                                        required
                                                    >
                                                        <option value="" disabled>Select your industry</option>
                                                        <option value="finance">Finance</option>
                                                        <option value="technology">Technology</option>
                                                        <option value="healthcare">Healthcare</option>
                                                        <option value="manufacturing">Manufacturing</option>
                                                        <option value="energy">Energy</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    label="Email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <Input
                                                    type="tel"
                                                    name="phone"
                                                    label="Phone Number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="message" className="form-label">How can we help you?</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                className="form-control"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={5}
                                            ></textarea>
                                        </div>
                                        <div className="mb-4">
                                            {siteKey ? (
                                                <ReCAPTCHA
                                                    sitekey={siteKey}
                                                    ref={recaptchaRef}
                                                />
                                            ) : (
                                                <div className="alert alert-warning">
                                                    reCAPTCHA is not configured. Please contact Site Owner.
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-100"
                                            borderRadius="10rem"
                                            color="#37B137"
                                        >
                                            Send Message
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 p-4"
                             style={{backgroundColor: "#F9F9F9", borderRadius: "1rem"}}>
                            <h5 className="mb-4" style={{color: "#2c3e50", fontWeight: "600"}}>
                                Get in touch
                            </h5>
                            <p className="text-muted mb-4" style={{fontSize: "0.95rem"}}>
                                Multiple ways you can connect with us
                            </p>

                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex align-items-start">
                                    <i className="bi bi-envelope-fill me-3 mt-1"
                                       style={{color: "#37B137", fontSize: "1.2rem"}}></i>
                                    <div>
                                        <p className="mb-0">
                                            <a href='mailto:info@ecovibe.co.ke'
                                               className="text-muted text-decoration-none">
                                                info@ecovibe.co.ke
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start">
                                    <i className="bi bi-geo-alt-fill me-3 mt-1"
                                       style={{color: "#37B137", fontSize: "1.2rem"}}></i>
                                    <div>
                                        <p className="mb-0 text-muted">The Mint Hub Offices

                                            Western Heights, <br></br>
                                            10th Floor<br></br>

                                            P.O Box 216-00606
                                            <br></br>
                                            Nairobi, Kenya </p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start">
                                    <i className="bi bi-clock-fill me-3 mt-1"
                                       style={{color: "#37B137", fontSize: "1.2rem"}}></i>
                                    <div>
                                        <p className="mb-0 text-muted">Mon - Fri: 8:00 AM - 6:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body pt-5">
                            <div style={{width: '100%'}}>
                                <iframe
                                    width="100%"
                                    height="400"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight="0"
                                    marginWidth="0"
                                    src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Western%20Heights+(EcoVibe%20Kenya)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                                    title="EcoVibe Kenya Location"
                                >
                                    <a href="https://www.mapsdirections.info/it/calcola-la-popolazione-su-una-mappa/">
                                        mappa della popolazione Italia
                                    </a>
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;