import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Button from "../../utils/Button";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const STATUSES = ["Draft", "Pending", "Published", "Rejected", "Archived"];

function PartnershipStatusModal({ show, opportunity, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (show && opportunity) {
      setSelectedStatus(opportunity.status || "Draft");
    }
  }, [show, opportunity]);

  const handleConfirm = async () => {
    if (!opportunity || !selectedStatus) return;
    try {
      setIsUpdating(true);
      await onUpdate(opportunity.id, selectedStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold d-flex align-items-center text-dark">
          <AutorenewIcon className="me-2 text-warning" />
          Change Status
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small text-secondary mb-3">
          Change the status of <strong>{opportunity?.title}</strong>. The
          current status is <strong>{opportunity?.status}</strong>.
        </p>
        <label className="form-label" htmlFor="partnership-status-select">
          Status
        </label>
        <select
          id="partnership-status-select"
          className="form-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          aria-label="Select new status"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Modal.Body>
      <Modal.Footer>
        <Button color="#37b137" hoverColor="#2a6e2aff" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="#f5a030"
          hoverColor="#e08e00"
          onClick={handleConfirm}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PartnershipStatusModal;