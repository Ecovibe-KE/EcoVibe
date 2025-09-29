import React from "react";
import Button from "react-bootstrap/Button";

const DeleteConfirmModal = ({ visible, resource, onCancel, onConfirm }) => {
  if (!visible) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3 shadow"
        style={{ width: 400, maxWidth: "90%" }}
      >
        <div className="p-3 border-bottom">
          <h6 className="mb-0">Confirm Delete</h6>
        </div>
        <div className="p-3">
          <p>
            Are you sure you want to delete <strong>{resource?.title}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
