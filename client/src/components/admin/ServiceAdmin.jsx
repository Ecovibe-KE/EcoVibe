import { Tab, Tabs, Row, Container, Col } from "react-bootstrap"
import { useState, useRef } from "react"
import handsImg from "../../assets/hands.jpg"
import collabImg1 from "../../assets/collaboration1.jpg"
import collabImg2 from "../../assets/collaboration2.jpg"
import gearImg from "../../assets/gears.png"
import tickImg from "../../assets/tick.png"
import "../../css/ServiceAdmin.css"
import ServiceAdminTop from "./ServiceAdminTop"
import ServiceAdminMain from "./ServiceAdminMain"
import ServiceForm from "./ServiceForm"

function ServiceAdmin() {

    const [formData, setFormData] = useState({
        serviceTitle: "",
        serviceDescription: "",
        priceCurrency: "KES",
        servicePrice: 0,
        serviceDuration: { hours: 0, minutes: 0 },
        serviceImage: null,
        serviceStatus: "active"
    })

    // for previewing the uploaded image
    const [previewUrl, setPreviewUrl] = useState("");

    // for resetting file upload name
    const fileInputRef = useRef(null);

    const topServiceData = [
        {
            imageSource: gearImg,
            number: 12,
            text: "Total Services",
            imageSetting: "info",
            colSetting: "me-3"
        },
        {
            imageSource: tickImg,
            number: 9,
            text: "Active Services",
            imageSetting: "success",
            colSetting: ""
        }
    ]

    const allServices = [
        {
            serviceImage: handsImg,
            serviceTitle: "ESG Strategy Development",
            serviceDescription: "Comprehensive ESG framework creation aligned with your business objectives and global sustainability standards.",
            serviceDuration: "2 hrs",
            priceCurrency: "$",
            servicePrice: "1200",
            serviceStatus: "Active"
        },
        {
            serviceImage: collabImg1,
            serviceTitle: "Sustainability Reporting",
            serviceDescription: "Transparent and compliant reporting following global frameworks to showcase your sustainability efforts.",
            serviceDuration: "2 hrs",
            priceCurrency: "$",
            servicePrice: "950",
            serviceStatus: "inactive"
        },
        {
            serviceImage: collabImg2,
            serviceTitle: "Carbon Footprint Assessment",
            serviceDescription: "Detailed analysis of your organization's carbon emissions with actionable reduction strategies.",
            serviceDuration: "2 hrs",
            priceCurrency: "$",
            servicePrice: "1500",
            serviceStatus: "Active"
        },
        {
            serviceImage: collabImg2,
            serviceTitle: "A short engaging title",
            serviceDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tristique nec sapien vel bibendum.",
            serviceDuration: "1 hr",
            priceCurrency: "$",
            servicePrice: "1000",
            serviceStatus: "Inactive"
        },
    ]

    function displayTopServiceData(dataArray) {
        return dataArray.map(({
            imageSource,
            number,
            text,
            imageSetting,
            colSetting
        }, index) => {
            return (
                <ServiceAdminTop
                    key={index}
                    imageSource={imageSource}
                    number={number}
                    text={text}
                    imageSetting={imageSetting}
                    colSetting={colSetting}
                ></ServiceAdminTop>
            )
        })
    }

    function displayAllServices(allServices) {
        // check if param is an empty array or object
        if ((Array.isArray(allServices) && allServices.length === 0) || (Object.keys(allServices).length === 0)) {
            return (<p>No Services added</p>)
        } else {
            return allServices.map(({
                serviceImage,
                serviceTitle,
                serviceDescription,
                serviceDuration,
                priceCurrency,
                servicePrice,
                serviceStatus
            }, index) => {
                return (
                    <ServiceAdminMain
                        key={index}
                        serviceImage={serviceImage}
                        serviceTitle={serviceTitle}
                        serviceDescription={serviceDescription}
                        serviceDuration={serviceDuration}
                        priceCurrency={priceCurrency}
                        servicePrice={servicePrice}
                        serviceStatus={serviceStatus}
                    ></ServiceAdminMain>

                )
            })
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
                }
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
            alert("Please select a valid image file.");
            e.target.value = ""; // reset input
            return;
        }

        // Save the File object to state
        setFormData(prev => ({ ...prev, serviceImage: file }));

        // Create a temporary preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

    }

    function handleSubmit(e) {
        e.preventDefault()
        console.log(formData)

        const { hours, minutes } = formData.serviceDuration;
        console.log(`${hours} hours ${minutes} minutes`)
        // resetForm()
    }

    function resetForm() {
        setFormData({
            serviceTitle: "",
            serviceDescription: "",
            priceCurrency: "KES",
            servicePrice: 0,
            serviceDuration: { hours: 0, minutes: 0 },
            serviceImage: null,
            serviceStatus: "active"
        })
        setPreviewUrl("");
        // Clear the file input's displayed filename
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <>
            <main className="p-3 bg-light">
                <Container className="mb-3">
                    <Row>
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
                                            {displayAllServices(allServices)}
                                        </Row>
                                    </Container>
                                </Tab>

                                <Tab eventKey="add" title="Add New Services">
                                    <ServiceForm
                                        formTitle="Add New Service"
                                        formData={formData}
                                        handleSubmit={handleSubmit}
                                        handleChange={handleChange}
                                        handleFileChange={handleFileChange}
                                        fileInputRef={fileInputRef}
                                        resetForm={resetForm}
                                        previewUrl={previewUrl}
                                    ></ServiceForm>
                                </Tab>

                                {/* <Tab eventKey="edit" title="Edit Services" className="d-none d-md-block container">
                                    <h2>Edit Service</h2>
                                    <hr />
                                </Tab> */}
                            </Tabs>

                        </Col>
                    </Row>
                </Container>
            </main >
        </>

    )
}

export default ServiceAdmin