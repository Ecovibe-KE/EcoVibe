/* eslint-disable react-refresh/only-export-components */
import { Col } from "react-bootstrap";

// Separates duration into hours and minutes
const separateDuration = (str) => {
  // 1. hrs? – matches "hr" or "hrs"
  // 2. (?: … )? – makes the entire minutes group optional
  const pattern = /(?:(?<h>\d+)\s*hrs?)?\s*(?:(?<m>\d+)\s*min)?/i;
  const groups = str.match(pattern)?.groups || {};

  const hours = parseInt(groups.h || "0", 10);
  const minutes = parseInt(groups.m || "0", 10);

  return { hours, minutes };
};

export function displayDuration(duration) {
  const { hours, minutes } = separateDuration(duration);
  if (minutes < 1) {
    return `${hours} hr`;
  } else if (hours < 1) {
    return `${minutes} min`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
}

function ServiceAdminMain({
  serviceId,
  serviceImage,
  serviceTitle,
  serviceDescription,
  serviceDuration,
  priceCurrency,
  servicePrice,
  serviceStatus,
  handleShowEdit,
  getServiceId,
  setFormData,
  setPreviewUrl,
  setOriginalServiceData,
  handleShowDelete,
}) {
  function determineVisibility() {
    if (serviceStatus.toLowerCase() === "active") {
      return "";
    } else {
      return "invisible";
    }
  }

  // Purpose
  // - display editServiceModal
  // - serviceId of clicked service
  // - populate formdata with clicked service data
  // - update clicked originalServiceData
  function handleEditClick() {
    handleShowEdit();
    getServiceId(() => serviceId);
    setFormData({
      serviceTitle: serviceTitle,
      serviceDescription: serviceDescription,
      priceCurrency: priceCurrency,
      servicePrice: servicePrice,
      serviceDuration: separateDuration(serviceDuration),
      serviceImage: serviceImage,
      serviceStatus: serviceStatus,
    });
    setOriginalServiceData({
      title: serviceTitle,
      description: serviceDescription,
      currency: priceCurrency,
      price: servicePrice,
      duration: serviceDuration,
      image: serviceImage,
      status: serviceStatus,
    });
    setPreviewUrl(() => serviceImage);
  }

  function handleDeleteClick() {
    handleShowDelete();
    getServiceId(() => serviceId);
    setOriginalServiceData({
      title: serviceTitle,
    });
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
              <button
                className="btn btn-warning btn-sm mx-1"
                onClick={handleEditClick}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm mx-1"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="card-body text-start d-flex flex-column justify-content-evenly">
            <h5>{serviceTitle}</h5>
            <p className="mt-2">{serviceDescription}</p>
            <hr />
            <section className="d-flex justify-content-between align-items-center">
              <p className="primary-color fw-bold m-0">
                {displayDuration(serviceDuration)}
              </p>
              <p className="primary-color fw-bold m-0">
                {priceCurrency + " " + servicePrice}
              </p>
              <p
                className={`status-color fw-bold border rounded-pill p-2 m-0 ${determineVisibility()}`}
              >
                {serviceStatus}
              </p>
            </section>
          </div>
        </div>
      </Col>
    </>
  );
}

export default ServiceAdminMain;
