import { Card } from "react-bootstrap";
import { StarBorder } from "@mui/icons-material";
import Button from "../utils/Button";
import { Link } from "react-router-dom";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GavelIcon from "@mui/icons-material/Gavel";
import { Carousel } from "react-bootstrap";
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
  const sectors = [
    {
      title: "Agriculture & Food Systems",
      goal: "Reduce waste, regenerate soils, and improve food security.",
      image: "/Agri.jpg",
    },
    {
      title: "Manufacturing & Industrial Processing",
      goal: "Embed resource efficiency, waste recovery, and clean production.",
      image: "/Manufacturing.jpg",
    },
    {
      title: "Waste Management & Plastics Recycling",
      goal: "Transition from linear 'take–make–dispose' to circular 'reduce–reuse–recycle–recover'.",
      image: "/recycle.jpg",
    },
    {
      title: "Energy & Transport",
      goal: "Promote clean energy and low-carbon transport.",
      image: "/energy.jpg",
    },
    {
      title: "Construction & Real Estate",
      goal: "Encourage sustainable material use and energy efficiency in buildings.",
      image: "/construction.jpg",
    },
    {
      title: "Water & Sanitation",
      goal: "Improve water efficiency, reuse, and wastewater recovery.",
      image: "/water.jpg",
    },
    {
      title: "Mining & Natural Resources",
      goal: "Ensure resource extraction and use align with regeneration principles.",
      image: "/mining.jpg",
    },
    {
      title: "Financial Sector",
      goal: "Channel capital into circular, sustainable investments.",
      image: "/finance.jpg",
    },
    {
      title: "Education & Capacity Development",
      goal: "Foster knowledge and innovation in sustainability.",
      image: "/Education.jpg",
    },
    {
      title: "ICT & Digital Economy",
      goal: "Enable digital solutions for circular monitoring and inclusion.",
      image: "/ICT.jpg",
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
              At Ecovibe Kenya, we understand that the Environmental, Social,
              and Governance (ESG) landscape is constantly evolving. Our team of
              experienced consultants stays at the forefront of these changes,
              ensuring your organization is always ahead of the curve.
            </p>
            <p className="text-muted mb-4">
              We believe that sustainable development isn't just about
              compliance, it's about creating lasting value for your business,
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
                className="rounded-5 img-fluid"
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
                <div className="card h-100 p-4 text-start rounded-5">
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
      <section className="p-5 bg-light">
        <h1
          className="fw-bold text-center"
          style={{
            marginBottom: "60px",
          }}>
          Empowering Every Industry for a Circular Future
        </h1>
        <p className="text mx-auto fw-bold fw-bold"
          style={{
            maxWidth: "700px",
            marginBottom: "60px",
            fontSize: 25,
            color: "#535252",
          }}>
          We collaborate with organizations across all sectors to embed circular
          economy principles into their operations. From policy design to
          project management, we help translate sustainability goals into
          measurable, lasting results.
        </p>
        <div id="esgCarousel" className="carousel slide " data-bs-ride="carousel">
          <div className="carousel-inner rounded-5">
            {sectors.map((sector, index) => (
              <div
                className={`carousel-item ${index === 0 ? "active" : ""}`}
                key={index}
              >
                <img
                  src={sector.image}
                  className="d-block w-100"
                  alt={sector.title}
                  style={{ height: "80vh", objectFit: "cover", filter: "brightness(70%)" }}
                />
                <div className="carousel-caption d-none d-md-block">
                  <h2 style={{ color: "#F5A030", fontWeight: "bold", textShadow: "2px 2px 6px rgba(0,0,0,0.5)" }}>
                    {sector.title}
                  </h2>
                  <p style={{
                    color: "#ffffff",
                    backgroundColor: "rgba(55, 177, 55, 0.7)",
                    borderRadius: "8px",
                    display: "inline-block",
                    padding: "8px 12px",
                    fontSize: "1.1rem"
                  }}>
                    {sector.goal}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#esgCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#esgCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>
    </>
  );
};
export default Homepage;
