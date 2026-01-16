import { Card } from "react-bootstrap";
import { StarBorder } from "@mui/icons-material";
import Button from "../utils/Button";
import { Link } from "react-router-dom";
import "../css/Homepage.css"

const Homepage = () => {

  const sectors = [
    {
      title: "Agriculture & Food Systems",
      goal: "Reduce waste, regenerate soils, and improve food security.",
      image: "/Agri.webp",
    },
    {
      title: "Manufacturing & Industrial Processing",
      goal: "Embed resource efficiency, waste recovery, and clean production.",
      image: "/Manufacturing.webp",
    },
    {
      title: "Waste Management & Plastics Recycling",
      goal: "Transition from linear 'take–make–dispose' to circular 'reduce–reuse–recycle–recover'.",
      image: "/recycle.webp",
    },
    {
      title: "Energy & Transport",
      goal: "Promote clean energy and low-carbon transport.",
      image: "/energy.webp",
    },
    {
      title: "Construction & Real Estate",
      goal: "Encourage sustainable material use and energy efficiency in buildings.",
      image: "/construction.webp",
    },
    {
      title: "Water & Sanitation",
      goal: "Improve water efficiency, reuse, and wastewater recovery.",
      image: "/water.webp",
    },
    {
      title: "Mining & Natural Resources",
      goal: "Ensure resource extraction and use align with regeneration principles.",
      image: "/mining.webp",
    },
    {
      title: "Financial Sector",
      goal: "Channel capital into circular, sustainable investments.",
      image: "/finance.webp",
    },
    {
      title: "Education & Capacity Development",
      goal: "Foster knowledge and innovation in sustainability.",
      image: "/Education.webp",
    },
    {
      title: "ICT & Digital Economy",
      goal: "Enable digital solutions for circular monitoring and inclusion.",
      image: "/ICT.webp",
    },
  ];

  return (
    <>
      <section className="bg-secondary">
        <Card className="bg-dark text-white border-0 rounded-0 vh-100">
          <Card.Img
            src="/forest.webp"
            className="h-100 w-100 object-fit-cover opacity-50"
            alt="Hero background"
          />
          <Card.ImgOverlay className="d-flex flex-column justify-content-center align-items-center text-center">
            <h1
              className="display-4 display-md-3 display-lg-2 fw-bold mb-3">
              ECOVIBE KENYA
            </h1>
            <p
              className="lh-1 fw-bold fst-italic myhero-p"
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
              Who We Are
            </h1>
            <p className="text-muted mb-2" style={{ marginBottom: 0 }}>
              <strong> EcoviBE Kenya </strong> is a circular economy and sustainable development consultancy dedicated to
              transforming how organisations, sectors, and communities use resources and create impact.
            </p>
            <p className="text-muted mb-2">
              We work with private companies, public institutions, and civil society to:
            </p>
            <div className="row mt-2">
              <div className="col-6 mb-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <small className="text-muted fw-bold">
                      Design closed‑loop systems that prioritise reuse, repair, and recycling.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <small className="text-muted fw-bold">
                      Build resource‑efficient value chains that reduce inputs and waste.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <small className="text-muted fw-bold">
                      Support sustainable livelihoods through inclusive employment and social innovation.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#37B137",
                    }}
                  ></div>
                  <div className="ms-2">
                    <small className="text-muted fw-bold">
                      Integrate circular thinking into strategy, policy, and operations.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 text-center">
            <Card className="shadow-sm border-0 rounded-5">
              <Card.Img
                src="/investment.webp"
                alt="EcoVibe ESG consultancy"
                className="rounded-5 img-fluid opacity-75"
              />
              <Card.ImgOverlay className="d-flex flex-column justify-content-center align-items-center text-center">
                <h3 className="fw-bold text-white ">
                  Our mission is to inspire systemic change toward a regenerative and low‑impact economy —
                  ensuring prosperity without depleting the planet’s natural capital.
                </h3>
              </Card.ImgOverlay>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="fw-bold mb-3">What We Do</h1>
            <p className="lead mx-auto col-lg-8">
              Our programs empower leaders, innovators, and community members with the tools
              to accelerate local and national transitions to sustainable models of production
              and consumption.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="h-100 p-4 bg-white rounded-4 shadow-sm">
                <h4 className="fw-bold mb-3 text-center" style={{ color: "#37B137" }}>
                  Circular Economy Strategy & Advisory
                </h4>
                <p>
                  We guide organisations in transitioning from resource-intensive linear
                  practices to closed-loop, regenerative business models. This includes:
                </p>
                <ul className="list-unstyled ms-3 my-4">
                  <li className="d-flex align-items-start mb-3">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>Material flow mapping & lifecycle analysis</strong>
                    </span>
                  </li>
                  <li className="d-flex align-items-start mb-3">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>Circular product and service design</strong>
                    </span>
                  </li>
                  <li className="d-flex align-items-start">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>
                        Implementation roadmaps for reuse, remanufacturing, and recycling
                        infrastructure
                      </strong>
                    </span>
                  </li>
                </ul>
                <p className="text-muted">
                  By retaining product value longer and keeping resources in use,
                  organisations can reduce environmental impacts and unlock new
                  economic opportunities.
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="h-100 p-4 bg-white rounded-4 shadow-sm">
                <h4 className="fw-bold mb-3 text-center" style={{ color: "#37B137" }}>
                  Capacity Building & Training
                </h4>
                <p>
                  We deliver training, workshops, and capacity-building sessions on:
                </p>
                <ul className="list-unstyled ms-3 my-4">
                  <li className="d-flex align-items-start mb-3">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>Circular economy principles and practice</strong>
                    </span>
                  </li>
                  <li className="d-flex align-items-start mb-3">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>Sustainable development pathways</strong>
                    </span>
                  </li>
                  <li className="d-flex align-items-start">
                    <span className="bullet"></span>
                    <span className="ms-3">
                      <strong>
                        Stakeholder engagement for multi-sector collaboration
                      </strong>
                    </span>
                  </li>
                </ul>
                <p className="text-muted">
                  Our programs equip leaders, innovators, and communities with
                  practical tools to drive lasting change.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      <section>
        <h1 className="fw-bold text-center">Our Impact Areas</h1>
        <div className="container my-5">
          <div className="row g-4 hover-cards">
            <div className="col-md-4">
              <div className="card h-100 hover-card">
                <img
                  src="Waste_valorization.webp"
                  className="card-img-top"
                  alt="Waste Valorisation"
                  height="200"
                />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Waste Valorisation</h4>
                  <p className="card-text">
                    Transform waste streams into valuable inputs and products through
                    recycling, upcycling, and resource recovery initiatives.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 hover-card">
                <img
                  src="Green_jobs.webp"
                  className="card-img-top"
                  alt="Green Jobs"
                  height="200"
                />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Green Innovation & Jobs</h4>
                  <p className="card-text">
                    Build new enterprises and value chains that create employment in
                    circular economy sectors like repair, remanufacturing, and composting.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 hover-card">
                <img
                  src="Resource_recovery.webp"
                  className="card-img-top"
                  alt="Resource Recovery"
                  height="200"
                />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Resource Recovery</h4>
                  <p className="card-text">
                    Promote sustainable systems that recover materials and extend product
                    lifecycles through circular design.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <section className="p-3 p-md-5 bg-light">
        <h1
          className="fw-bold text-center mb-3">
          Empowering Every Industry for a Circular Future
        </h1>
        <p className="mx-auto lead fs-4 mb-3 text-center" style={{ maxWidth: "700px" }}>
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
                  className="d-block w-100 vh-40 vh-md-80"
                  alt={sector.title}
                  style={{ objectFit: "cover", filter: "brightness(70%)" }}
                />
                <div className="carousel-caption">
                  <h2 style={{ color: "#F5A030", fontWeight: "bold", textShadow: "2px 2px 6px rgba(0,0,0,0.5)" }}>
                    {sector.title}
                  </h2>
                  <p className="" style={{
                    color: "#ffffff",
                    backgroundColor: "#37B137",
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
      <section className="py-5 bg-success bg-opacity-10">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <h2 className="fw-bold mb-3">
                Why Circular Economy Matters
              </h2>
              <p className="mb-4">
                The circular economy is an alternative to the traditional
                <strong> “take-make-dispose”</strong> model. It focuses on:
              </p>
              <ul className="list-unstyled ms-2">
                <li className="d-flex align-items-start mb-3">
                  <span className="circle-bullet"></span>
                  <span className="ms-3">
                    <strong>Designing out waste</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start mb-3">
                  <span className="circle-bullet"></span>
                  <span className="ms-3">
                    <strong>Keeping products and materials in circulation</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="circle-bullet"></span>
                  <span className="ms-3">
                    <strong>Regenerating natural systems</strong>
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-muted">
                This approach reduces pollution, conserves natural resources, and builds
                economic resilience—contributing directly to sustainable development goals
                such as responsible consumption and production, decent work, and climate
                action.
              </p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="p-5 bg-white rounded-4 shadow-sm text-center h-100">
                <h3 className="fw-bold mb-3">
                  Get Involved
                </h3>
                <p className="mb-4">
                  Whether you are a business redesigning your product lifecycle, a community
                  organisation driving sustainable practices at the local level, or a
                  government partner advancing national development goals,
                  <strong> EcoviBE Kenya</strong> can help unleash your circular potential.
                </p>
                <Link to={"/contact"}>
                <Button>
                  Contact Us
                </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  );
};
export default Homepage;
