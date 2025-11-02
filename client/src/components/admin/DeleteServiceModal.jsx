import { Modal } from "react-bootstrap";
import Button from "../../utils/Button";

function DeleteServiceModal({
  showDeleteServiceModal,
  handleCloseDelete,
  handleDelete,
  serviceTitle,
}) {
  return (
    <>
      <Modal
        show={showDeleteServiceModal}
        onHide={handleCloseDelete}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <h2>Delete {serviceTitle}</h2>
          <hr />
          Are you sure you want to delete this service?
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="#37b137"
            hoverColor="#2a6e2aff"
            onClick={handleCloseDelete}
          >
            Close
          </Button>
          <Button color="#e74c3c" hoverColor="#c0392b" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteServiceModal;
