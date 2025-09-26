import { Col } from "react-bootstrap"

function ServiceAdminMain({ serviceImage, serviceName, serviceDescription, serviceDuration, serviceCurrency, servicePrice, serviceStatus }) {

    function determineVisibility() {
        if (serviceStatus.toLowerCase() == "active") {
            return ""
        } else {
            return "invisible"
        }
    }

    return (
        <>
            <Col md="4">
                <div className="card rounded-2 shadow h-100">
                    <img alt="service image" className="img-fluid rounded-top-2 fixed-card-img" src={serviceImage} />
                    <div className="card-body text-start d-flex flex-column justify-content-evenly">
                        <h5>{serviceName}</h5>
                        <p className="mt-2">{serviceDescription}</p>
                        <hr />
                        <section className="d-flex justify-content-between align-items-center">
                            <p className="primary-color fw-bold m-0">{serviceDuration}</p>
                            <p className="primary-color fw-bold m-0">{serviceCurrency}{servicePrice}</p>
                            <p className={`active-status-color fw-bold border rounded-pill p-2 m-0 ${determineVisibility()}`} >{serviceStatus}</p>
                        </section>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default ServiceAdminMain