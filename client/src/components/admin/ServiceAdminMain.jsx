import { Col } from "react-bootstrap"

function ServiceAdminMain({
    serviceImage,
    serviceTitle,
    serviceDescription,
    serviceDuration,
    priceCurrency,
    servicePrice,
    serviceStatus
}) {

    function determineVisibility() {
        if (serviceStatus.toLowerCase() === "active") {
            return ""
        } else {
            return "invisible"
        }
    }

    return (
        <>
            <Col md="4">
                <div className="card rounded-2 shadow h-100">
                    <div className="image-wrapper">
                        <img
                            alt="service image"
                            src={serviceImage}
                            className="img-fluid rounded-top-2"
                        />

                        {/* Overlay with buttons (hidden by default) */}
                        <div className="hover-overlay">
                            <button className="btn btn-light btn-sm mx-1">Edit</button>
                            <button className="btn btn-danger btn-sm mx-1">Delete</button>
                        </div>
                    </div>

                    <div className="card-body text-start d-flex flex-column justify-content-evenly">
                        <h5>{serviceTitle}</h5>
                        <p className="mt-2">{serviceDescription}</p>
                        <hr />
                        <section className="d-flex justify-content-between align-items-center">
                            <p className="primary-color fw-bold m-0">{serviceDuration}</p>
                            <p className="primary-color fw-bold m-0">
                                {priceCurrency}{servicePrice}
                            </p>
                            <p
                                className={
                                    `status-color fw-bold border rounded-pill p-2 m-0 ${determineVisibility()}`
                                }
                            >
                                {serviceStatus}
                            </p>
                        </section>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default ServiceAdminMain