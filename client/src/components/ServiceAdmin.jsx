import { Tab, Tabs, Form, Dropdown, Row, Container, Col } from "react-bootstrap"
import Input from "../utils/Input"
import Button from "../utils/Button"
import handsImg from "../assets/hands.jpg"
import collabImg1 from "../assets/collaboration1.jpg"
import collabImg2 from "../assets/collaboration2.jpg"
import gearImg from "../assets/gears.png"
import tickImg from "../assets/tick.png"
import "../css/ServiceAdmin.css"
import ServiceAdminTop from "./ServiceAdminTop"
import ServiceAdminMain from "./ServiceAdminMain"

function ServiceAdmin() {

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
            serviceName: "ESG Strategy Development",
            serviceDescription: "Comprehensive ESG framework creation aligned with your business objectives and global sustainability standards.",
            serviceDuration: "2 hrs",
            serviceCurrency: "$",
            servicePrice: "1200",
            serviceStatus: "Active"
        },
        {
            serviceImage: collabImg1,
            serviceName: "Sustainability Reporting",
            serviceDescription: "Transparent and compliant reporting following global frameworks to showcase your sustainability efforts.",
            serviceDuration: "2 hrs",
            serviceCurrency: "$",
            servicePrice: "950",
            serviceStatus: "inactive"
        },
        {
            serviceImage: collabImg2,
            serviceName: "Carbon Footprint Assessment",
            serviceDescription: "Detailed analysis of your organization's carbon emissions with actionable reduction strategies.",
            serviceDuration: "2 hrs",
            serviceCurrency: "$",
            servicePrice: "1500",
            serviceStatus: "Active"
        },
        {
            serviceImage: collabImg2,
            serviceName: "A short engaging title",
            serviceDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tristique nec sapien vel bibendum.",
            serviceDuration: "1 hr",
            serviceCurrency: "$",
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
        // serviceImage, serviceName, serviceDescription, serviceDuration, serviceCurrency, servicePrice, serviceStatus
        return allServices.map(({ serviceImage, serviceName, serviceDescription, serviceDuration, serviceCurrency, servicePrice, serviceStatus }, index) => {
            return (
                <ServiceAdminMain key={index} serviceImage={serviceImage} serviceName={serviceName} serviceDescription={serviceDescription} serviceDuration={serviceDuration} serviceCurrency={serviceCurrency} servicePrice={servicePrice} serviceStatus={serviceStatus}></ServiceAdminMain>
            )
        })
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
                                    <Container>
                                        <h2>Add New Service</h2>
                                        <hr />

                                        <Form>
                                            <Input
                                                type="text"
                                                label="Service Title"
                                                name="service_title"
                                                placeholder="Enter Service Title"
                                            />

                                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                <Form.Label> Service Description</Form.Label>
                                                <Form.Control as="textarea" rows={3} placeholder="Enter Service Description" />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="formServiceCategory">
                                                <Form.Label>Service Category</Form.Label>
                                                <Form.Select aria-label="Select Service Category" required>
                                                    <option value="">Select a category</option>
                                                    <option value="strategy">ESG Strategy Development</option>
                                                    <option value="reporting">Sustainability Reporting</option>
                                                    <option value="assessment">Carbon Footprint Assessment</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <Input
                                                type="text"
                                                label="Price Currency"
                                                name="currency"
                                                placeholder="Enter Price Currency"
                                            />

                                            <Input
                                                type="number"
                                                label="Price"
                                                name="price"
                                                placeholder="Enter Service Price"
                                            />

                                            {/* duration dropdown */}
                                            <Form.Group className="mb-3" controlId="formServiceDuration">
                                                <Form.Label>Service Duration</Form.Label>
                                                <Form.Select aria-label="Select Service Duration" required>
                                                    <option value="">Select a duration</option>
                                                    <option value="1hour">1 hour</option>
                                                    <option value="2hours">2 hours</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group controlId="formFile" className="mb-3">
                                                <Form.Label>Service Image</Form.Label>
                                                <Form.Control type="file" />
                                            </Form.Group>

                                            {/* status dropdown */}
                                            <Form.Group className="mb-3" controlId="formServiceStatus">
                                                <Form.Label>Service Status</Form.Label>
                                                <Form.Select aria-label="Select Service Status">
                                                    <option value="">Select a duration</option>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <div className="d-flex justify-content-end">
                                                <Button
                                                    color="#e74c3c"
                                                    hoverColor="#c0392b"
                                                >Cancel</Button>
                                                <Button
                                                    color="#37b137"
                                                    hoverColor="#2a6e2aff"
                                                >Save Service</Button>
                                            </div>
                                        </Form>
                                    </Container>
                                </Tab>

                                {/* <Tab eventKey="edit" title="Edit Services" className="d-none d-md-block container">
                                    <h2>Edit Service</h2>
                                    <hr />
                                </Tab> */}
                            </Tabs>

                        </Col>
                    </Row>
                </Container>
            </main>
        </>

    )
}

export default ServiceAdmin