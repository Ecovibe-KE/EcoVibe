import { Modal } from "react-bootstrap";
import Button from "../../utils/Button";

function DeletePartnershipModal({
  show,
  onClose,
  onDelete,
  opportunityTitle,
}) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <h2>Delete {opportunityTitle}</h2>
        <hr />
        Are you sure you want to delete this opportunity? This action cannot be
        undone.
      </Modal.Body>
      <Modal.Footer>
        <Button color="#37b137" hoverColor="#2a6e2aff" onClick={onClose}>
          Close
        </Button>
        <Button color="#e74c3c" hoverColor="#c0392b" onClick={onDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeletePartnershipModal;