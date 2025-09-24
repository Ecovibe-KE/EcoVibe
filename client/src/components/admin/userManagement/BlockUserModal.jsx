import React from "react";
import Button from "react-bootstrap/Button";

const BlockUserModal = ({ visible, user, type = "block", onCancel, onConfirm }) => {
  if (!visible || !user) return null;

  const isBlockAction = type === "block";
  const title = isBlockAction ? "Confirm Blocking" : "Confirm Unblocking";
  const confirmButtonText = isBlockAction ? "Block" : "Unblock";
  const confirmButtonClass = isBlockAction ? "btn-danger" : "btn-success";
  const actionDescription = isBlockAction ? "block" : "unblock";
  const consequenceText = isBlockAction
    ? "This action cannot be undone. Do you want to proceed?"
    : "This will restore the user's access. Do you want to proceed?";

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
          <h6 className="mb-0">{title}</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          ></button>
        </div>
        <div className="p-3">
          <p className="mb-2">You are about to {actionDescription} this user:</p>
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
            <div className="d-flex justify-content-between">
              <span className="text-muted">Current Status</span>
              <span className="fw-semibold">{user.status}</span>
            </div>
          </div>
          <p className="mb-0">{consequenceText}</p>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button
            type="button"
            className="btn btn-light me-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={`btn ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal;