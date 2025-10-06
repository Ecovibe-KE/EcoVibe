import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const PrivacyPolicy = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 p-4">
            <Card.Body>
              <Card.Title as="h1" className="text-center mb-4 fw-bold">
                Privacy Policy
              </Card.Title>
              <Card.Subtitle className="text-muted text-center mb-4">
                Last Updated: October 3, 2025
              </Card.Subtitle>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Introduction</h2>
                <p className="text-start">
                  Ecovibe Kenya ("we," "us," or "our") is committed to
                  protecting your privacy. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your personal
                  information when you visit our website (www.ecovibe.co.ke),
                  engage with our sustainability consulting services, or
                  interact with us in any other way. By using our services, you
                  agree to the terms outlined in this policy.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Information We Collect</h2>
                <p className="text-start">
                  We may collect the following types of information:
                </p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Personal Information:</strong> Name, email address,
                    phone number, organization details, and other information
                    you provide when contacting us, requesting services, or
                    participating in our programs.
                  </li>
                  <li className="list-group-item">
                    <strong>Non-Personal Information:</strong> Data such as IP
                    addresses, browser type, device information, and website
                    usage statistics collected through cookies and similar
                    technologies.
                  </li>
                  <li className="list-group-item">
                    <strong>Client Data:</strong> Information provided by
                    clients during sustainability consulting, compliance, or ESG
                    reporting processes, which may include business-related
                    data.
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">
                  How We Use Your Information
                </h2>
                <p className="text-start">We use your information to:</p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Provide and improve our consultancy services, including
                    sustainability compliance and ESG reporting.
                  </li>
                  <li className="list-group-item">
                    Respond to inquiries, provide customer support, and
                    communicate updates about our services.
                  </li>
                  <li className="list-group-item">
                    Analyze website usage to enhance user experience and
                    optimize our website.
                  </li>
                  <li className="list-group-item">
                    Comply with legal obligations under the Kenya Data
                    Protection Act, 2019, and other applicable laws.
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">
                  How We Share Your Information
                </h2>
                <p className="text-start">
                  We do not sell or rent your personal information. We may share
                  your information with:
                </p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Service providers who assist us in delivering our services
                    (e.g., website hosting or analytics providers).
                  </li>
                  <li className="list-group-item">
                    Regulatory authorities when required by law or to protect
                    our legal rights.
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">
                  Cookies and Tracking Technologies
                </h2>
                <p className="text-start">
                  Our website uses cookies to enhance your browsing experience
                  and collect analytics data. You can manage your cookie
                  preferences through your browser settings. By continuing to
                  use our website, you consent to our use of cookies as
                  described in this policy.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Data Security</h2>
                <p className="text-start">
                  We implement reasonable technical and organizational measures
                  to protect your personal information from unauthorized access,
                  loss, or misuse. However, no system is completely secure, and
                  we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Your Rights</h2>
                <p className="text-start">
                  Under the Kenya Data Protection Act, 2019, you have the right
                  to:
                </p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Access, correct, or delete your personal information.
                  </li>
                  <li className="list-group-item">
                    Object to or restrict the processing of your data.
                  </li>
                  <li className="list-group-item">
                    Request data portability, where applicable.
                  </li>
                </ul>
                <p className="text-start">
                  To exercise these rights, please contact us at{" "}
                  <a href="mailto:info@ecovibe.co.ke" className="text-primary">
                    info@ecovibe.co.ke
                  </a>
                  .
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Third-Party Links</h2>
                <p className="text-start">
                  Our website may contain links to third-party websites. We are
                  not responsible for the privacy practices or content of these
                  websites. We encourage you to review their privacy policies
                  before providing any personal information.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">
                  Changes to This Privacy Policy
                </h2>
                <p className="text-start">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or legal requirements. The updated
                  policy will be posted on our website with the revised "Last
                  Updated" date.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Contact Us</h2>
                <p className="text-start">
                  If you have any questions or concerns about this Privacy
                  Policy or our data practices, please contact us at:
                </p>
                <p className="text-start">
                  Ecovibe Kenya
                  <br />
                  Email:{" "}
                  <a href="mailto:info@ecovibe.co.ke" className="text-primary">
                    info@ecovibe.co.ke
                  </a>
                  <br />
                  Website:{" "}
                  <a href="https://www.ecovibe.co.ke" className="text-primary">
                    www.ecovibe.co.ke
                  </a>
                </p>
              </section>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;
