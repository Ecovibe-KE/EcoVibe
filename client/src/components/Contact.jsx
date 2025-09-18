import React from "react";

function Contact() {
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
                    <div className="col-lg-7">form</div>
                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 h-100"
                             style={{backgroundColor: "#F9F9F9", borderRadius: "1rem"}}>
                            <div className="card-body p-4 p-md-5">
                                <h2 className="h3 fw-bold mb-3">Get in touch</h2>
                                <p className="text-muted mb-4">
                                    Multiple ways you can connect with us
                                </p>

                                <div className="d-flex flex-column gap-4">
                                    <div>
                                        <p className="mb-0 text-muted">
                                            info@ecovibe.co.ke
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-0 text-muted">
                                            Nairobi kenya
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-0 text-muted">
                                            Mon - Fri: 8:00 AM - 6:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
