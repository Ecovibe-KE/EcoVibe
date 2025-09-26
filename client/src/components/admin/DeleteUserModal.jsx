import React from "react";
import Button from "react-bootstrap/Button";

const DeleteUserModal = ({ visible, user, onCancel, onConfirm }) => {
  if (!visible || !user) return null;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white"
        style={{ borderRadius: 12, width: 520, maxWidth: "90%" }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Confirm Deletion</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          ></button>
        </div>
        <div className="p-3">
          <p className="mb-2">You are about to delete this user:</p>
          <div
            className="border rounded p-2 mb-3"
            style={{ background: "#f8fafc" }}
          >
            <div className="d-flex justify-content-between">
              <span className="text-muted">Name</span>
              <span className="fw-semibold">{user.name}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Email</span>
              <span className="fw-semibold">{user.email}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Phone</span>
              <span className="fw-semibold">{user.phone}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Role</span>
              <span className="fw-semibold">{user.role}</span>
            </div>
          </div>
          <p className="mb-0">
            This action cannot be undone. Do you want to proceed?
          </p>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button
            type="button"
            className="btn btn-light me-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
