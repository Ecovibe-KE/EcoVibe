import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const Terms = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 p-4">
            <Card.Body>
              <Card.Title as="h1" className="text-center mb-4 fw-bold">
                Terms and Conditions
              </Card.Title>
              <Card.Subtitle className="text-muted text-center mb-4">
                Last Updated: October 3, 2025
              </Card.Subtitle>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Introduction</h2>
                <p className="text-start">
                  Welcome to Ecovibe Kenya ("we," "us," or "our"). These Terms
                  and Conditions ("Terms") govern your use of our website
                  (www.ecovibe.co.ke), our sustainability consulting services.
                  By accessing or using our services, you agree to be bound by
                  these Terms. If you do not agree, please do not use our
                  services.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Use of Our Services</h2>
                <p className="text-start">
                  You agree to use our services only for lawful purposes and in
                  accordance with these Terms. You may not:
                </p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Use our services in a way that violates any applicable laws
                    or regulations, including the Kenya Data Protection Act,
                    2019.
                  </li>
                  <li className="list-group-item">
                    Attempt to gain unauthorized access to our systems,
                    networks, or data.
                  </li>
                  <li className="list-group-item">
                    Use our website or services to distribute harmful content,
                    including malware or other malicious code.
                  </li>
                  <li className="list-group-item">
                    Misrepresent your identity or provide false information when
                    engaging with our services.
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Consulting Services</h2>
                <p className="text-start">
                  Ecovibe Kenya provides sustainability consulting, including
                  ESG compliance, legal advisory, and readiness assessments. Our
                  services are subject to separate agreements with clients,
                  which outline the scope, deliverables, and payment terms. By
                  engaging our consulting services, you agree to comply with the
                  terms of those agreements.
                </p>
              </section>
              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Intellectual Property</h2>
                <p className="text-start">
                  All content on our website, including text, images, logos, and
                  educational materials, is the property of Ecovibe Kenya or its
                  licensors and is protected by intellectual property laws. You
                  may not reproduce, distribute, or modify our content without
                  prior written permission, except for personal, non-commercial
                  use.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Limitation of Liability</h2>
                <p className="text-start">
                  To the fullest extent permitted by law, Ecovibe Kenya shall
                  not be liable for any indirect, incidental, or consequential
                  damages arising from your use of our services or website. Our
                  services are provided "as is," and we do not guarantee that
                  they will be error-free or uninterrupted.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Indemnification</h2>
                <p className="text-start">
                  You agree to indemnify and hold Ecovibe Kenya, its affiliates,
                  and employees harmless from any claims, losses, or damages
                  arising from your use of our services or violation of these
                  Terms.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Termination</h2>
                <p className="text-start">
                  We reserve the right to terminate or suspend your access to
                  our services or website at our sole discretion, without
                  notice, for conduct that violates these Terms or is harmful to
                  other users or our business interests.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Governing Law</h2>
                <p className="text-start">
                  These Terms are governed by the laws of Kenya. Any disputes
                  arising from these Terms or your use of our services will be
                  resolved in the courts of Kenya.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Changes to These Terms</h2>
                <p className="text-start">
                  We may update these Terms from time to time to reflect changes
                  in our practices or legal requirements. The updated Terms will
                  be posted on our website with the revised "Last Updated" date.
                  Your continued use of our services after such changes
                  constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="h4 mb-3 fw-semibold">Contact Us</h2>
                <p className="text-start">
                  If you have any questions or concerns about these Terms,
                  please contact us at:
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

export default Terms;
