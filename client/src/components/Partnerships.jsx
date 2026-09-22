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
        isFunding ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"
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
          <img src={CalendarIcon} alt="Launch" className="me-1" width={14} height={14} />
          <time dateTime={opportunity.launch_date}>
            {opportunity.launch_date
              ? new Date(opportunity.launch_date).toLocaleDateString()
              : "—"}
          </time>
        </span>
        <span className="d-flex align-items-center me-3 mb-1">
          <img src={CalendarIcon} alt="Deadline" className="me-1" width={14} height={14} />
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
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        setLoading(true);
        const response = await fetchAllPartnerships();
        setOpportunities(response?.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching partnerships:", err);
        setError("Failed to load opportunities. Please try again later.");
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
          Partnerships &amp; Funding
        </h1>
      </div>
      <p className="p-4 text-center">
        Explore partnership and funding opportunities to collaborate on
        sustainable, environment-friendly initiatives and grow your impact.
      </p>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="success" />
          <span className="ms-2 text-secondary">Loading opportunities...</span>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p className="text-danger">{error}</p>
          <Button
            size="sm"
            color="#37b137"
            hoverColor="#f5a030"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : opportunities.length === 0 ? (
        <p className="text-center text-secondary py-5">
          No opportunities are available at the moment. Check back soon.
        </p>
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