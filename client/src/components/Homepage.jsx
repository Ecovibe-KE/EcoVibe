import { Card } from "react-bootstrap";
import { StarBorder } from "@mui/icons-material";
import Button from "../utils/Button";
import { Link } from "react-router-dom";
const Homepage = () => {
  const services = [
    {
      heading: "Sustainability Framework Development",
      content:
        "Design tailored ESG and SDG-aligned frameworks for various sectors, integrating sustainability into corporate, community, and government programs.",
    },
    {
      heading: "ESG Advisory & Compliance",
      content:
        "Helping organizations meet national and global ESG reporting requirements through ESG gap assessments and compliance audits.",
    },
    {
      heading: "Capacity Building & Training",
      content:
        "Training organizations, community leaders, and grassroots groups on sustainability practices, and delivering workshops on financial literacy, leadership, innovation, and SDG integration.",
    },
    {
      heading: "Climate Finance Access & Project Structuring",
      content:
        "Structuring green, sustainability-linked, and blended finance instruments, while supporting MSMEs and community-driven projects to access climate finance.",
    },
    {
      heading: "Partnership Development (SDG17 Focus)",
      content:
        "Creating multi-stakeholder partnerships to drive development programs and facilitate collaborations between the private sector, civil society, and government.",
    },
    {
      heading: "Circular Economy Solutions",
      content:
        "Designing strategies to maximize resource use and reduce waste, while supporting industries such as mining to optimize human labor and resources sustainably.",
    },
    {
      heading: "Policy Research & Advocacy",
      content:
        "Publishing policy frameworks aligned with SDGs for professional and development sectors, and advising on sustainable governance systems and judicial reforms.",
    },
    {
      heading: "Monitoring, Evaluation & Impact Reporting",
      content:
        "Tracking sustainability performance and providing impact measurement reports, while supporting transparent disclosure for investors and stakeholders.",
    },
  ];
  return (
    <>
      <section className=" bg-secondary">
        <Card className="bg-dark text-white border-0 rounded-0 vh-100">
          <Card.Img
            src="/forest-272595_1280 2.png"
            className="h-100 w-100 object-fit-cover opacity-50"
            alt="Hero background"
          />
          <Card.ImgOverlay className="d-flex flex-column justify-content-center align-items-center text-center">
            <h1
              className="display-4 display-md-3 display-lg-2 fw-normal mb-5"
              style={{ fontSize: 60 }}
            >
              ECOVIBE KENYA
            </h1>
            <p
              className="lead lh-1 fw-bold fst-italic"
              style={{ maxWidth: "700px", fontSize: "36px" }}
            >
              Leading the way in offering cutting-edge solutions for sustainable
              development. We provide expert consultancy services and keep you
              up to date with the evolving ESG landscape.{" "}
            </p>
            <div className="d-flex flex-row gap-2">
              <Link to={"/services"}>
                <Button
                  color="#37B137"
                  hoverColor="none"
                  className="rounded-pill px-4 text-white fs-5 fst-italic fw-bold"
                >
                  SERVICES
                </Button>
              </Link>
              <Link to={"/contact"}>
                <Button
                  color="#FFFFFF"
                  hoverColor="none"
                  className="rounded-pill px-4 fst-italic fs-5 fw-bold text-success"
                >
                  CONTACT
                </Button>
              </Link>
            </div>
          </Card.ImgOverlay>
        </Card>
        <section className="py-5" style={{ background: "#B2B2B2" }}>
          <div className="container text-center"></div>
        </section>
      </section>
      <section className="container my-5 ">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 mb-4 mb-lg-0">
            <h1 className="fw-bold mb-4">
              Navigating the ESG Landscape with Expertise
            </h1>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              At EcoVibe Kenya, we understand that the Environmental, Social,
              and Governance (ESG) landscape is constantly evolving. Our team of
              experienced consultants stays at the forefront of these changes,
              ensuring your organization is always ahead of the curve.
            </p>
            <p className="text-muted mb-4">
              We believe that sustainable development isn't just about
              compliance—it's about creating lasting value for your business,
              community, and the environment. Our cutting-edge solutions are
              tailored to meet the unique challenges facing organizations in
              Kenya and across East Africa.
            </p>
            <div className="row mt-4">
              <div className="col-6 mb-3">
                <div className="d-flex align-items-start">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <h6 className="fw-bold mb-0">Regulatory Compliance</h6>
                    <small className="text-muted">
                      Interpreting and integrating ESG-related laws and
                      reporting frameworks.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-start">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <h6 className="fw-bold mb-0">Carbon Management</h6>
                    <small className="text-muted">
                      Advising on climate strategies that deliver both
                      mitigation and adaptation outcomes.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-start">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <h6 className="fw-bold mb-0">ESG Governance Frameworks</h6>
                    <small className="text-muted">
                      Designing structures for accountability, transparency,and
                      responsible leadership.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-start">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <h6 className="fw-bold mb-0">
                      Training & Capacity Building
                    </h6>
                    <small className="text-muted">
                      Empower your teams with ESG knowledge
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 text-center">
            <Card className="shadow-sm border-0">
              <Card.Img
                src="/investment-5241253_1280 2.png"
                alt="EcoVibe ESG consultancy"
                className="rounded-3 img-fluid"
              />
            </Card>
          </div>
        </div>
      </section>
      <section className="container-fluid bg-light py-4 px-4">
        <div className="text-center mb-5 mx-5">
          <div className="text-center">
            <h1
              className="fw-bold "
              style={{
                marginBottom: "60px",
              }}
            >
              Our Consultancy Services
            </h1>
            <p
              className="text mx-auto fw-bold fw-bold"
              style={{
                maxWidth: "700px",
                marginBottom: "60px",
                fontSize: 25,
                color: "#535252",
              }}
            >
              We offer comprehensive ESG consultancy services designed to help
              your organization navigate the complex landscape of sustainable
              development and create a lasting impact.
            </p>
          </div>

          <div className="row g-4">
            {services.map((service, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={index}>
                <div className="card h-100 shadow-sm border-0 p-4 text-start">
                  <div
                    className="d-flex align-items-center gap-2 mb-4  "
                    style={{ height: "35px" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#F5A030",
                        color: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        width: "30px",
                        height: "30px",
                        padding: "5px",
                        justifyContent: "center",
                        borderRadius: "50%",
                      }}
                    >
                      <StarBorder style={{ fontSize: 20 }} />
                    </div>
                    <h5 className="fw-bold mb-1">{service.heading}</h5>
                  </div>
                  <p className="text-muted">{service.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default Homepage;
