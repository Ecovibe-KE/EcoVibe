import React from "react";
import StatusInfo from "./StatusInfo.jsx";

const ViewUserModal = ({ visible, user, onClose }) => {
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
        style={{ borderRadius: 12, width: 640, maxWidth: "95%" }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">User Details</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="p-3">
          <div className="d-flex align-items-center mb-3" style={{ gap: 16 }}>
            <img
              src={user.profileImage || "https://via.placeholder.com/80"}
              alt={user.name}
              width="80"
              height="80"
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <h5 className="mb-1">{user.name}</h5>
              <StatusInfo status={user.status} />
            </div>
          </div>
          <div className="row g-3">
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Full name</span>
                <span className="fw-semibold">{user.name}</span>
              </div>
            </div>
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Phone</span>
                <span className="fw-semibold">{user.phone || "—"}</span>
              </div>
            </div>
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Email</span>
                <span className="fw-semibold">{user.email}</span>
              </div>
            </div>
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Role</span>
                <span className="fw-semibold">{user.role}</span>
              </div>
            </div>
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Created</span>
                <span className="fw-semibold">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
            <div className="col-sm-6">
              <div
                className="d-flex justify-content-between border rounded p-2"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-muted">Last updated</span>
                <span className="fw-semibold">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
