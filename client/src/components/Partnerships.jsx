import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Button from "../utils/Button";
import { fetchAllPartnerships } from "../api/services/partnershipService";
import CalendarIcon from "../assets/Calendar.png";
import placeholderImage from "../assets/placeholder.png";
import style from "../css/Partnerships.module.css";

const PartnershipBadge = ({ type }) => {
  const isFunding = type === "Funding";
  return (
    <span
      className={`badge rounded-pill py-1 px-2 me-1 ${
        isFunding
          ? "bg-success-subtle text-success"
          : "bg-primary-subtle text-primary"
      }`}
    >
      <small className="fw-medium">{type}</small>
    </span>
  );
};

const Partnership = ({ opportunity, onCreate }) => {
  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
      <div className="ratio ratio-16x9 rounded-3 overflow-hidden mb-3">
        <img
          src={opportunity.image || placeholderImage}
          alt={opportunity.title}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>

      <div className="mb-2">
        {opportunity.type && <PartnershipBadge type={opportunity.type} />}
      </div>

      <h3 className="fs-5 fw-semibold text-dark mb-2">{opportunity.title}</h3>

      <p
        className="small text-muted mb-3"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {opportunity.description}
      </p>

      <div className="d-flex flex-wrap align-items-center small text-secondary mb-4">
        <span className="d-flex align-items-center me-3 mb-1">
          <img
            src={CalendarIcon}
            alt="Launch"
            className="me-1"
            width={14}
            height={14}
          />
          <time dateTime={opportunity.launch_date}>
            {opportunity.launch_date
              ? new Date(opportunity.launch_date).toLocaleDateString()
              : "—"}
          </time>
        </span>
        <span className="d-flex align-items-center me-3 mb-1">
          <img
            src={CalendarIcon}
            alt="Deadline"
            className="me-1"
            width={14}
            height={14}
          />
          <time dateTime={opportunity.deadline_date}>
            {opportunity.deadline_date
              ? new Date(opportunity.deadline_date).toLocaleDateString()
              : "—"}
          </time>
        </span>
      </div>

      <div className="mt-auto">
        <Button
          size="sm"
          color="#37b137"
          hoverColor="#f5a030"
          onClick={() => onCreate(opportunity.id)}
        >
          View Details →
        </Button>
      </div>
    </div>
  );
};

const Partnerships = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        setLoading(true);
        const response = await fetchAllPartnerships();
        setOpportunities(response?.data || []);
      } catch (err) {
        console.error("Error fetching partnerships:", err);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    loadPartnerships();
  }, []);

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className={`fw-bold d-block ${style.sustainabilityUnderline}`}>
          Partnerships
        </h1>
      </div>
      <p className="p-4 text-center">
        Explore partnership and funding opportunities to collaborate on
        sustainable, environment-friendly initiatives and grow your impact.
      </p>

      {loading? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="success" />
          <span className="ms-2 text-secondary">Loading opportunities...</span>
        </div>
      ): opportunities.length === 0 ? (
        <div
          className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center mx-auto my-4"
          style={{ maxWidth: 720 }}
        >
          <h2 className="fw-bold text-dark mb-3">
            Partnership Opportunities
          </h2>
          <p className="text-muted mb-3">
            Ecovibe Kenya welcomes strategic partnerships and collaborations
            from all sectors, including private businesses, public
            institutions, (International)/Non Governmental Organizations, as
            well as community initiatives.
          </p>
          <p className="text-muted mb-3">
            We are actively seeking forward thinking partners to co-create
            sustainable solutions and bridge the gap in realizing a true
            circular economy environment. Whether through joint sustainability
            projects, green innovation, or impactful resource management, we
            believe that cross sector collaboration is vital to scaling
            eco-friendly practices.
          </p>
          <p className="text-muted mb-3">
            Our doors are always open to impactful ideas and strategic
            alliances.
          </p>

          <div className="text-start mx-auto mb-4" style={{ maxWidth: 620 }}>
            <h3 className="fw-bold h6 text-dark mb-3">
              How to Partner with Us
            </h3>
            <ul className="list-unstyled text-muted mb-0">
              <li className="d-flex mb-2">
                <span className="fw-semibold text-dark me-2">
                  Cross sector Innovation:
                </span>
                <span>
                  We collaborate with businesses and organizations of all sizes
                  to integrate circularity into their operations.
                </span>
              </li>
              <li className="d-flex mb-2">
                <span className="fw-semibold text-dark me-2">
                  Sustainability Initiatives:
                </span>
                <span>
                  We co-design and implement localized green projects that
                  drive measurable environmental impact.
                </span>
              </li>
              <li className="d-flex">
                <span className="fw-semibold text-dark me-2">
                  Knowledge &amp; Resource Sharing:
                </span>
                <span>
                  We invite technical experts and advocacy groups to join
                  forces in accelerating sustainable development.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-muted mb-0">
            If your organization shares our vision of eliminating waste and
            driving a circular economy in Kenya, we want to hear from you.
            Reach out to our partnership team today to discuss how we can work
            together.
          </p>
          {/* <p className="small fw-medium text-secondary mb-0">
            Check back soon for upcoming opportunities.
          </p>*/}
        </div>
      ) : (
        <div className="row g-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="col-12 col-md-6 col-lg-4">
              <Partnership
                opportunity={opp}
                onCreate={(id) => navigate(`/partnerships/${id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Partnerships;
