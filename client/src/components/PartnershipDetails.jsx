import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Button from "../utils/Button";
import { fetchPartnershipById } from "../api/services/partnershipService";
import CalendarIcon from "../assets/Calendar.png";
import placeholderImage from "../assets/placeholder.png";

const PartnershipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchOpportunity = async () => {
      try {
        const data = await fetchPartnershipById(id);
        setOpportunity(data?.data || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching partnership:", err);
        setError(
          "Unable to load this opportunity. It may no longer be available.",
        );
        toast.error("Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <Container className="py-5">
      <Button
        onClick={() => navigate("/partnerships")}
        size="sm"
        color="#37b137"
        hoverColor="#f5a030"
      >
        ← Back to Opportunities
      </Button>

      {error || !opportunity ? (
        <div className="text-center mt-5">
          <p className="text-secondary">{error || "Opportunity not found."}</p>
          <Button
            size="sm"
            color="#37b137"
            hoverColor="#f5a030"
            onClick={() => navigate("/partnerships")}
          >
            View All Opportunities
          </Button>
        </div>
      ) : (
        <Row className="justify-content-center mt-4">
          <Col lg={8} md={10} sm={12}>
            {opportunity.type && (
              <div className="text-center mb-3">
                <span
                  className={`badge rounded-pill py-2 px-3 ${
                    opportunity.type === "Funding"
                      ? "bg-success-subtle text-success"
                      : "bg-primary-subtle text-primary"
                  }`}
                >
                  {opportunity.type}
                </span>
              </div>
            )}

            <h1 className="fw-bold text-center mb-4">{opportunity.title}</h1>

            <div className="text-center mb-4">
              <img
                src={opportunity.image || placeholderImage}
                alt={opportunity.title}
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{ maxHeight: 420, objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = placeholderImage;
                }}
              />
            </div>

            <div className="d-flex justify-content-center align-items-center gap-3 text-muted small mb-5 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <img src={CalendarIcon} alt="Launch" width={16} height={16} />
                <span>
                  Launch:{" "}
                  {opportunity.launch_date
                    ? new Date(opportunity.launch_date).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img src={CalendarIcon} alt="Deadline" width={16} height={16} />
                <span>
                  Deadline:{" "}
                  {opportunity.deadline_date
                    ? new Date(opportunity.deadline_date).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="text-start px-1">
              <p
                className="text-muted fs-6 lh-lg"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {opportunity.description}
              </p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PartnershipDetails;
