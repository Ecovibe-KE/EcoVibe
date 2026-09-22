import React, { useState, useCallback, useEffect } from "react";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PaidIcon from "@mui/icons-material/Paid";
import FilterListIcon from "@mui/icons-material/FilterList";
import CampaignIcon from "@mui/icons-material/Campaign";
import Input from "../../utils/Input";
import Button from "../../utils/Button";
import {
  fetchAllPartnerships,
  deletePartnership,
  updatePartnershipStatus,
} from "../../api/services/partnershipService";
import PartnershipFormModal from "./PartnershipFormModal.jsx";
import DeletePartnershipModal from "./DeletePartnershipModal.jsx";
import PartnershipStatusModal from "./PartnershipStatusModal.jsx";
import CalendarIcon from "../../assets/Calendar.png";
import placeholderImage from "../../assets/placeholder.png";
import { toast } from "react-toastify";

const ChevronDown = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const StatCard = ({ icon, value, label }) => {
  return (
    <div className="card p-4 rounded-3 shadow-sm border-start border-4 border-light d-flex flex-row align-items-center">
      <div className="flex-shrink-0 me-3">{icon}</div>
      <div>
        <div className="fs-3 fw-semibold text-dark">{value}</div>
        <div className="fs-5 fw-medium text-secondary small">{label}</div>
      </div>
    </div>
  );
};

const TypeBadge = ({ type }) => {
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

const StatusBadge = ({ status }) => {
  const palette = {
    Published: {
      colorClass: "text-success",
      bgColorClass: "bg-success-subtle",
    },
    Draft: { colorClass: "text-warning", bgColorClass: "bg-warning-subtle" },
    Pending: { colorClass: "text-primary", bgColorClass: "bg-primary-subtle" },
    Rejected: { colorClass: "text-danger", bgColorClass: "bg-danger-subtle" },
    Archived: {
      colorClass: "text-secondary",
      bgColorClass: "bg-secondary-subtle",
    },
  };
  const { colorClass, bgColorClass } = palette[status] || palette.Archived;
  return (
    <span
      className={`badge rounded-pill py-1 px-2 ${bgColorClass} ${colorClass}`}
    >
      <small className="fw-medium">{status}</small>
    </span>
  );
};

const PartnershipAdmin = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All Types");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllPartnerships();
        setOpportunities(response?.data || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch opportunities. Please try again later.");
        if (import.meta.env.MODE !== "production") {
          console.error("Error fetching partnerships:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadPartnerships();
  }, []);

  const filterOpportunities = useCallback(() => {
    let updated = [...opportunities];

    if (selectedType !== "All Types") {
      updated = updated.filter((opp) => opp.type === selectedType);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      updated = updated.filter(
        (opp) =>
          (opp.title || "").toLowerCase().includes(term) ||
          (opp.description || "").toLowerCase().includes(term),
      );
    }

    setFilteredOpportunities(updated);
  }, [opportunities, selectedType, searchTerm]);

  useEffect(() => {
    filterOpportunities();
  }, [filterOpportunities]);

  const openCreate = useCallback(() => {
    setEditingOpportunity(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((opp) => {
    setEditingOpportunity(opp);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback((result) => {
    setIsFormOpen(false);
    setEditingOpportunity(null);
    if (result && result.id) {
      setOpportunities((prev) => {
        const exists = prev.some((opp) => opp.id === result.id);
        if (exists) {
          return prev.map((opp) => (opp.id === result.id ? result : opp));
        }
        return [result, ...prev];
      });
    }
  }, []);

  const openDelete = useCallback((opp) => {
    setDeleteTarget(opp);
    setShowDeleteModal(true);
  }, []);

  const closeDelete = useCallback(() => {
    setDeleteTarget(null);
    setShowDeleteModal(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deletePartnership(deleteTarget.id);
      setOpportunities((prev) =>
        prev.filter((opp) => opp.id !== deleteTarget.id),
      );
      closeDelete();
      toast.success("Opportunity deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete opportunity. Please try again later.");
      if (import.meta.env.MODE !== "production") {
        console.error("Error deleting partnership:", err);
      }
    }
  }, [deleteTarget, closeDelete]);

  const openStatus = useCallback((opp) => {
    setStatusTarget(opp);
    setShowStatusModal(true);
  }, []);

  const closeStatus = useCallback(() => {
    setStatusTarget(null);
    setShowStatusModal(false);
  }, []);

  const handleStatusUpdate = useCallback(
    async (id, newStatus) => {
      try {
        setStatusUpdatingId(id);
        const response = await updatePartnershipStatus(id, newStatus);
        const updated = response?.data;
        if (updated && updated.id) {
          setOpportunities((prev) =>
            prev.map((opp) => (opp.id === updated.id ? updated : opp)),
          );
        }
        toast.success("Status updated successfully.");
        closeStatus();
      } catch (err) {
        toast.error("Failed to update status. Please try again later.");
        if (import.meta.env.MODE !== "production") {
          console.error("Error updating partnership status:", err);
        }
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [closeStatus],
  );

  const totalOpportunities = opportunities.length;
  const fundingCount = opportunities.filter((o) => o.type === "Funding").length;
  const partnershipCount = opportunities.filter(
    (o) => o.type === "Partnership",
  ).length;
  const publishedCount = opportunities.filter(
    (o) => o.status === "Published",
  ).length;

  const typeOptions = ["All Types", "Funding", "Partnership"];

  return (
    <div className="min-vh-100 bg-light py-4 py-sm-5 font-sans">
      <div className="container-fluid">
        <header className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
          <div>
            <h1 className="fs-3 fw-semibold text-dark">
              Partnerships &amp; Funding
            </h1>
            <p className="text-secondary mt-1">
              Create and manage partnership and funding opportunities
            </p>
          </div>
          <Button
            action={"add"}
            variant="primary"
            label={"Create Opportunity"}
            onClick={openCreate}
          />
        </header>

        {/* Stat Cards Section */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<HandshakeIcon fontSize="large" color="primary" />}
              value={totalOpportunities}
              label="Total Opportunities"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<CardMembershipIcon fontSize="large" color="success" />}
              value={publishedCount}
              label="Published"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<PaidIcon fontSize="large" color="warning" />}
              value={fundingCount}
              label="Funding"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<CampaignIcon fontSize="large" color="error" />}
              value={partnershipCount}
              label="Partnerships"
            />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card border-0 p-3 mb-5 rounded-3">
          <div className="d-flex flex-column flex-md-row gap-3">
            <div className="flex-grow-1 position-relative">
              <Input
                type="text"
                placeholder="Search opportunities by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-0 rounded-3 border-light-subtle"
              />
            </div>

            <div className="d-flex gap-3">
              <FilterListIcon fontSize="large" color="success" />
            </div>

            {/* Type Dropdown */}
            <div className="dropdown" style={{ width: "11rem" }}>
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="btn btn-outline-secondary dropdown-toggle w-100 py-2 d-flex justify-content-between align-items-center"
                type="button"
              >
                <span className="small">{selectedType}</span>
                <ChevronDown
                  className={`ms-2 small transition-transform ${isTypeOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              {isTypeOpen && (
                <div
                  className="dropdown-menu show rounded-3 shadow-lg p-0"
                  style={{
                    minWidth: "100%",
                    border: "1px solid var(--bs-light-border-subtle)",
                  }}
                >
                  {typeOptions.map((option) => (
                    <a
                      key={option}
                      className={`dropdown-item small ${option === selectedType ? "bg-primary-subtle text-primary fw-medium" : "text-dark"}`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedType(option);
                        setIsTypeOpen(false);
                      }}
                    >
                      {option}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opportunity List */}
        {isLoading && (
          <div className="text-secondary">Loading opportunities...</div>
        )}
        {error && <div className="text-danger">{error}</div>}
        {!isLoading && !error && filteredOpportunities.length === 0 && (
          <div className="text-secondary">No opportunities found.</div>
        )}

        <div className="d-flex flex-column gap-4">
          {!isLoading &&
            !error &&
            filteredOpportunities.map((opp) => (
              <OpportunityItem
                key={opp.id}
                opportunity={opp}
                isUpdating={statusUpdatingId === opp.id}
                onEdit={() => openEdit(opp)}
                onDelete={() => openDelete(opp)}
                onStatus={() => openStatus(opp)}
              />
            ))}
        </div>
      </div>

      <PartnershipFormModal
        show={isFormOpen}
        onClose={closeForm}
        opportunity={editingOpportunity}
      />

      <DeletePartnershipModal
        show={showDeleteModal}
        onClose={closeDelete}
        onDelete={confirmDelete}
        opportunityTitle={deleteTarget?.title}
      />

      <PartnershipStatusModal
        show={showStatusModal}
        opportunity={statusTarget}
        onClose={closeStatus}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
};

const OpportunityItem = ({
  opportunity,
  isUpdating,
  onEdit,
  onDelete,
  onStatus,
}) => {
  return (
    <div className="card border-0 p-4 rounded-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
      <div className="d-flex flex-shrink-0 mb-3 mb-md-0 me-md-3">
        <img
          src={opportunity.image || placeholderImage}
          alt={opportunity.title || "Partnership"}
          width={72}
          height={54}
          className="rounded-3 border"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>

      <div className="flex-grow-1 min-w-0 me-md-4">
        <div className="mb-2">
          {opportunity.type && <TypeBadge type={opportunity.type} />}
          {opportunity.status && <StatusBadge status={opportunity.status} />}
        </div>

        <h2 className="fs-5 fw-semibold text-dark mb-1 lh-sm">
          {opportunity.title}
        </h2>
        <p
          className="small text-secondary mb-3"
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

        <div className="d-flex flex-wrap align-items-center small text-secondary">
          <span className="d-flex align-items-center me-3">
            <img
              src={CalendarIcon}
              alt="Launch"
              className="me-1"
              width={14}
              height={14}
            />
            <span>
              Launch:{" "}
              {opportunity.launch_date
                ? new Date(opportunity.launch_date).toLocaleDateString()
                : "—"}
            </span>
          </span>
          <span className="d-flex align-items-center me-3">
            <img
              src={CalendarIcon}
              alt="Deadline"
              className="me-1"
              width={14}
              height={14}
            />
            <span>
              Deadline:{" "}
              {opportunity.deadline_date
                ? new Date(opportunity.deadline_date).toLocaleDateString()
                : "—"}
            </span>
          </span>
        </div>
      </div>

      <div className="d-flex gap-2 mt-3 mt-md-0 flex-shrink-0">
        <Button
          action="update"
          label="Edit"
          outline
          hoverColor={"#FFF"}
          hoverTextColor={"#000"}
          disabled={isUpdating}
          onClick={onEdit}
        />
        <Button
          action="view"
          label="Status"
          outline
          hoverColor={"#FFF"}
          hoverTextColor={"#000"}
          disabled={isUpdating}
          onClick={onStatus}
        />
        <Button
          action="delete"
          label="Delete"
          outline
          hoverColor={"#FFF"}
          hoverTextColor={"#000"}
          disabled={isUpdating}
          onClick={onDelete}
        />
      </div>
    </div>
  );
};

export default PartnershipAdmin;
