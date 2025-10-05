import { Tab, Tabs, Row, Container, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useState, useRef, useEffect } from "react";
import gearImg from "../../assets/gears.png";
import tickImg from "../../assets/tick.png";
import "../../css/ServiceAdmin.css";
import ServiceAdminTop from "./ServiceAdminTop";
import ServiceAdminMain from "./ServiceAdminMain";
import ServiceForm from "./ServiceForm";
import EditServiceModal from "./EditServiceModal";
import DeleteServiceModal from "./DeleteServiceModal";
import {
  addService,
  getServices,
  updateService,
  deleteService,
} from "../../api/services/servicemanagement";

function ServiceAdmin() {
  // for edit modal component
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  // for delete modal component
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  // for displaying services
  const [allServices, setAllServices] = useState([]);
  // get serviceId
  const [idService, setIdService] = useState(null);
  // for original data when in edit modal component
  const [originalServiceData, setOriginalServiceData] = useState(null);
  // reset image file input name
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleCloseEdit = () => setShowEditServiceModal(false);
  const handleShowEdit = () => setShowEditServiceModal(true);
  const handleCloseDelete = () => setShowDeleteServiceModal(false);
  const handleShowDelete = () => setShowDeleteServiceModal(true);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      if (response.status === "success") {
        setAllServices(response.data)
      } else {
        toast.error(`Failed to fetch services: ${response.message}. Please try again later`)
      }
    } catch (error) {
      toast.error(
        `Failed to fetch service: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  // Get all services
  useEffect(() => {
    fetchServices();
  }, []);

  const [formData, setFormData] = useState({
    serviceTitle: "",
    serviceDescription: "",
    priceCurrency: "KES",
    servicePrice: 0,
    serviceDuration: { hours: 0, minutes: 0 },
    serviceImage: null,
    serviceStatus: "active",
  });

  // for previewing the uploaded image
  const [previewUrl, setPreviewUrl] = useState("");

  // for resetting file upload name
  const fileInputRef = useRef(null);

  const topServiceData = [
    {
      imageSource: gearImg,
      number: allServices.length,
      text: "Total Services",
      imageSetting: "info",
      colSetting: "me-3",
    },
    {
      imageSource: tickImg,
      number: allServices.filter(
        (service) => service.status?.toLowerCase() === "active",
      ).length,
      text: "Active Services",
      imageSetting: "success",
      colSetting: "",
    },
  ];

  function displayTopServiceData(dataArray) {
    return dataArray.map(
      ({ imageSource, number, text, imageSetting, colSetting }, index) => {
        return (
          <ServiceAdminTop
            key={index}
            imageSource={imageSource}
            number={number}
            text={text}
            imageSetting={imageSetting}
            colSetting={colSetting}
          ></ServiceAdminTop>
        );
      },
    );
  }

  function displayAllServices(
    allServices,
    handleShowEdit,
    getServiceId,
    setFormData,
    setPreviewUrl,
    setOriginalServiceData,
    handleShowDelete,
  ) {
    // check if param is an empty array or object
    if (
      (Array.isArray(allServices) && allServices.length === 0) ||
      Object.keys(allServices).length === 0
    ) {
      return <p>No Services added</p>;
    } else {
      return [...allServices]
        .reverse()
        .map(
          ({
            id,
            image,
            title,
            description,
            duration,
            currency,
            price,
            status,
          }) => {
            return (
              <ServiceAdminMain
                key={id}
                serviceId={id}
                serviceImage={image}
                serviceTitle={title}
                serviceDescription={description}
                serviceDuration={duration}
                priceCurrency={currency}
                servicePrice={price}
                serviceStatus={status}
                handleShowEdit={handleShowEdit}
                getServiceId={getServiceId}
                setFormData={setFormData}
                setPreviewUrl={setPreviewUrl}
                setOriginalServiceData={setOriginalServiceData}
                handleShowDelete={handleShowDelete}
              ></ServiceAdminMain>
            );
          },
        );
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    // handle duration fields separately
    if (name === "durationHours" || name === "durationMinutes") {
      setFormData((prev) => ({
        ...prev,
        serviceDuration: {
          ...prev.serviceDuration,
          [name === "durationHours" ? "hours" : "minutes"]: value,
        },
      }));
      return;
    }

    // Handle all other inputs
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow image MIME types
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = ""; // reset input
      return;
    }

    // Convert image to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, serviceImage: reader.result })); // reader.result is Base64 string
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // handle submitting newly added service
  const addNewService = async (e) => {
    e.preventDefault();

    const { hours, minutes } = formData.serviceDuration;
    const combinedDuration = `${hours} hr ${minutes} min`;

    try {
      const serviceData = {
        title: formData.serviceTitle.trim(),
        description: formData.serviceDescription.trim(),
        currency: formData.priceCurrency.trim(),
        price: formData.servicePrice,
        duration: combinedDuration,
        image: formData.serviceImage,
        status: formData.serviceStatus.toLowerCase(),
      };

      const response = await addService(serviceData);
      if (response.status === "success") {
        toast.success(response.message);
        // keep allServices up to date after adding new service
        await fetchServices();
        resetForm();
      } else {
        toast.error(`Failed to add service: ${response.message}. Please try again`);
      }
    } catch (error) {
      toast.error(
        `Failed to add service: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // handle submitting edited service
  const editExistingService = async (e) => {
    e.preventDefault();

    const { hours, minutes } = formData.serviceDuration;
    const combinedDuration = `${hours} hr ${minutes} min`;

    const serviceData = {
      title: formData.serviceTitle.trim(),
      description: formData.serviceDescription.trim(),
      currency: formData.priceCurrency.trim(),
      price: formData.servicePrice,
      duration: combinedDuration,
      image: formData.serviceImage,
      status: formData.serviceStatus.toLowerCase(),
    };

    // Compare with originalServiceData
    const isUnchanged =
      originalServiceData &&
      serviceData.title === originalServiceData.title &&
      serviceData.description === originalServiceData.description &&
      serviceData.currency === originalServiceData.currency &&
      serviceData.price === originalServiceData.price &&
      serviceData.duration === originalServiceData.duration &&
      serviceData.status === originalServiceData.status &&
      serviceData.image === originalServiceData.image;

    if (isUnchanged) {
      toast.info(
        "No changes detected. Edit one or more service fields to save",
      );
      return;
    }

    try {
      const response = await updateService(idService, serviceData);

      if (response.status === "success") {
        toast.success(response.message);
        // keep allServices up to date after adding new service
        await fetchServices();
        handleCloseEdit();
        resetForm();
      } else {
        toast.error(`Failed to edit service: ${response.message} Please try again`);
      }

    } catch (error) {
      toast.error(
        `Failed to update service: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // handle deleting service
  const deleteExistingService = async () => {
    try {
      const response = await deleteService(idService);

      if (response.status === "success") {
        await fetchServices();
        handleCloseDelete();
        toast.success(response.message);
      }
    } catch (error) {
      toast.error(
        `Failed to delete service: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  function resetForm() {
    setFormData({
      serviceTitle: "",
      serviceDescription: "",
      priceCurrency: "KES",
      servicePrice: 0,
      serviceDuration: { hours: 0, minutes: 0 },
      serviceImage: null,
      serviceStatus: "active",
    });
    setPreviewUrl("");
    // Clear the file input's displayed filename
    setFileInputKey(Date.now());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <button onClick={() => {
        toast.success("Button Test Toast")
        console.log("CLICKED")
      }}>Show Toast</button>
      <main className="p-3 bg-light">
        {/* edit service */}
        <EditServiceModal
          fileInputKey={fileInputKey}
          showEditServiceModal={showEditServiceModal}
          handleCloseEdit={handleCloseEdit}
          formData={formData}
          handleSubmit={editExistingService}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          resetForm={resetForm}
        />

        {/* Delete service */}
        <DeleteServiceModal
          showDeleteServiceModal={showDeleteServiceModal}
          handleCloseDelete={handleCloseDelete}
          handleDelete={deleteExistingService}
          serviceTitle={originalServiceData ? originalServiceData.title : ""}
        />

        <Container className="mb-3">
          <Row className="d-flex flex-nowrap">
            {displayTopServiceData(topServiceData)}
          </Row>
        </Container>

        <Container className="shadow p-3 rounded-2 bg-white">
          <Row>
            <Col>
              <Tabs
                defaultActiveKey="services"
                className="mb-3"
                id="services-tabs"
              >
                <Tab eventKey="services" title="Services">
                  <Container>
                    <h2>All Services</h2>
                    <hr />
                    <Row className="g-3">
                      {displayAllServices(
                        allServices,
                        handleShowEdit,
                        setIdService,
                        setFormData,
                        setPreviewUrl,
                        setOriginalServiceData,
                        handleShowDelete,
                      )}
                    </Row>
                  </Container>
                </Tab>

                <Tab eventKey="add" title="Add New Services">
                  <ServiceForm
                    fileInputKey={fileInputKey}
                    formTitle="Add New Service"
                    formData={formData}
                    handleSubmit={addNewService}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    fileInputRef={fileInputRef}
                    resetForm={resetForm}
                    previewUrl={previewUrl}
                  ></ServiceForm>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </main>
      <ToastContainer />
    </>
  );
}

export default ServiceAdmin;
