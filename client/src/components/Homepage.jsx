import { Card } from "react-bootstrap";
import Button from "../utils/Button";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import ImpactCard from "./ImpactCard";
import "../css/Homepage.css";

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

  const focusAreas = [
    {
      title: "Recycling",
      description:
        "Design practical recovery systems that keep materials in circulation and reduce landfill pressure.",
      image: "/recycle.webp",
      alt: "Recycling and resource recovery",
    },
    {
      title: "Waste Management",
      description:
        "Turn waste challenges into opportunities through sorting, recovery, and responsible collection models.",
      image: "/Waste_valorization.webp",
      alt: "Waste management and valorisation",
    },
    {
      title: "Community Empowerment",
      description:
        "Support households and local leaders with the knowledge and tools to build resilient livelihoods.",
      image: "/Empower.png",
      alt: "Community empowerment and training",
    },
    {
      title: "Sustainable Agriculture",
      description:
        "Advance regenerative food systems that protect soils, improve yields, and reduce resource waste.",
      image: "/Agri.webp",
      alt: "Sustainable agriculture and food systems",
    },
    {
      title: "Green Innovation",
      description:
        "Drive new business models, digital tools, and circular products that create measurable impact.",
      image: "/Green_jobs.webp",
      alt: "Green innovation and circular jobs",
    },
  ];

  return (
    <>
      <section className="hero-shell">
        <Card className="hero-card border-0 rounded-0 vh-100">
          <Card.Img
            src="/forest.webp"
            className="hero-image"
            alt="A vibrant green landscape representing circular economy initiatives"
          />
          <Card.ImgOverlay className="d-flex align-items-center">
            <div className="container py-5">
              <div className="row align-items-center gy-4">
                <div className="col-12 col-lg-7">
                  <p className="hero-eyebrow" >
                    Circular economy • Sustainable development • Community impact
                  </p>
                  <h1 className="display-4 display-md-3 display-lg-2 fw-bold mb-3 text-white">
                    ECOVIBE KENYA
                  </h1>
                  <p className="hero-copy">
                    We provide grassroots empowerment through sensitization trainings to build knowledge on various economic endeavors at ward level.
                  </p>
                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <Link to="/contact">
                      <Button
                        color="#37B137"
                        hoverColor="#2d8b2d"
                        className="rounded-pill px-4 py-2 text-white fw-bold"
                      >
                        Contact us
                      </Button>
                    </Link>
                    <a href="#impact" className="hero-link">
                      Explore our work
                    </a>
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <div className="hero-panel">
                    <h3 className="fw-bold mb-3">What we champion</h3>
                    <ul className="list-unstyled mb-0">
                      <li>• Regenerative production and consumption</li>
                      <li>• Community-led sustainability education</li>
                      <li>• Circular innovation across sectors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card.ImgOverlay>
        </Card>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <SectionHeading
                eyebrow="Who we are"
                title="A trusted partner for regenerative growth"
                intro="EcoVibe Kenya is a circular economy and sustainable development consultancy dedicated to transforming how organisations, sectors, and communities use resources and create impact."
                align="start"
              />
              <p className="text-muted mb-3">
                We work with private companies, public institutions, and civil society to:
              </p>
              <div className="row mt-2">
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="rounded-circle bullet-dot"></span>
                    <small className="ms-2 text-muted fw-bold">
                      Design closed-loop systems that prioritise reuse, repair, and recycling.
                    </small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="rounded-circle bullet-dot"></span>
                    <small className="ms-2 text-muted fw-bold">
                      Build resource-efficient value chains that reduce inputs and waste.
                    </small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="rounded-circle bullet-dot"></span>
                    <small className="ms-2 text-muted fw-bold">
                      Support sustainable livelihoods through inclusive employment and social innovation.
                    </small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="rounded-circle bullet-dot"></span>
                    <small className="ms-2 text-muted fw-bold">
                      Integrate circular thinking into strategy, policy, and operations.
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <Card className="shadow-card border-0 rounded-5 overflow-hidden">
                <Card.Img
                  src="/investment.webp"
                  alt="EcoVibe Kenya supporting circular and sustainable development"
                  className="img-fluid w-100"
                />
                <Card.ImgOverlay className="d-flex flex-column justify-content-end p-4 text-start">
                  <div className="hero-panel hero-panel--overlay">
                    <h3 className="fw-bold text-white mb-0">
                      Our mission is to inspire systemic change toward a regenerative and low-impact economy — ensuring prosperity without depleting the planet’s natural capital.
                    </h3>
                  </div>
                </Card.ImgOverlay>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-soft">
        <div className="container">
          <SectionHeading
            eyebrow="What we do"
            title="Practical solutions for people, places, and prosperity"
            intro="Our programs empower leaders, innovators, and community members with the tools to accelerate local and national transitions to sustainable models of production and consumption."
          />
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="info-card h-100">
                <h4 className="fw-bold mb-3 text-center" style={{ color: "#37B137" }}>
                  Circular Economy Strategy & Advisory
                </h4>
                <p>
                  We guide organisations in transitioning from resource-intensive linear practices to closed-loop, regenerative business models. This includes:
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
                      <strong>Implementation roadmaps for reuse, remanufacturing, and recycling infrastructure</strong>
                    </span>
                  </li>
                </ul>
                <p className="text-muted mb-0">
                  By retaining product value longer and keeping resources in use, organisations can reduce environmental impacts and unlock new economic opportunities.
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="info-card h-100">
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
                      <strong>Stakeholder engagement for multi-sector collaboration</strong>
                    </span>
                  </li>
                </ul>
                <p className="text-muted mb-0">
                  Our programs equip leaders, innovators, and communities with practical tools to drive lasting change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="py-5 bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Our focus areas"
            title="A practical foundation for circular progress"
            intro="From waste systems to community training, our work spans the everyday interventions that build lasting sustainability."
          />
          <div className="row g-4">
            {focusAreas.map((area) => (
              <ImpactCard
                key={area.title}
                image={area.image}
                title={area.title}
                description={area.description}
                alt={area.alt}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-soft">
        <div className="container">
          <SectionHeading
            eyebrow="Our impact areas"
            title="Creating value across local and national systems"
            intro="We collaborate with organizations across all sectors to embed circular economy principles into their operations."
          />
          <div className="row g-4 hover-cards">
            <div className="col-12 col-md-4">
              <div className="card h-100 hover-card border-0 shadow-sm">
                <img src="Waste_valorization.webp" className="card-img-top" alt="Waste valorisation" height="220" />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Waste Valorisation</h4>
                  <p className="card-text">
                    Transform waste streams into valuable inputs and products through recycling, upcycling, and resource recovery initiatives.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 hover-card border-0 shadow-sm">
                <img src="Green_jobs.webp" className="card-img-top" alt="Green jobs" height="220" />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Green Innovation & Jobs</h4>
                  <p className="card-text">
                    Build new enterprises and value chains that create employment in circular economy sectors like repair, remanufacturing, and composting.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 hover-card border-0 shadow-sm">
                <img src="Resource_recovery.webp" className="card-img-top" alt="Resource recovery" height="220" />
                <div className="card-body">
                  <h4 className="card-title fw-bold">Resource Recovery</h4>
                  <p className="card-text">
                    Promote sustainable systems that recover materials and extend product lifecycles through circular design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-3 p-md-5 bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Across sectors"
            title="Empowering every industry for a circular future"
            intro="We collaborate with organizations across all sectors to embed circular economy principles into their operations."
          />
          <div id="esgCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner rounded-5">
              {sectors.map((sector, index) => (
                <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
                  <img
                    src={sector.image}
                    className="d-block w-100 vh-40 vh-md-80"
                    alt={sector.title}
                    style={{ objectFit: "cover", filter: "brightness(70%)" }}
                  />
                  <div className="carousel-caption">
                    <h2 className="carousel-title">{sector.title}</h2>
                    <p className="carousel-goal">{sector.goal}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#esgCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#esgCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-5 bg-soft">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <h2 className="fw-bold mb-3">Why Circular Economy Matters</h2>
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
                This approach reduces pollution, conserves natural resources, and builds economic resilience, contributing directly to sustainable development goals.
              </p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="p-5 bg-white rounded-4 shadow-sm text-center h-100">
                <h3 className="fw-bold mb-3">Get Involved</h3>
                <p className="mb-4">
                  Whether you are a business redesigning your product lifecycle, a community organisation driving sustainable practices at the local level, or a government partner advancing national development goals,
                  <strong> EcoVibe Kenya</strong> can help unleash your circular potential.
                </p>
                <Link to="/contact">
                  <Button color="#37B137" hoverColor="#2d8b2d" className="rounded-pill px-4 py-2 text-white fw-bold">
                    Contact us
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
