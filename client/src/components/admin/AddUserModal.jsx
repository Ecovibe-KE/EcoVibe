import React from "react";
import Input from "../../utils/Input.jsx";
import Button from "react-bootstrap/Button";

const AddUserModal = ({
  visible,
  addForm,
  addFieldErrors,
  currentUserRole,
  addError,
  onChange,
  onCancel,
  onSave,
}) => {
  if (!visible) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white"
        style={{ borderRadius: 12, width: 560, maxWidth: "90%" }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Add User</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          />
        </div>
        <div className="p-3">
          <Input
            type="text"
            label="Full name"
            name="name"
            value={addForm.name}
            onChange={onChange}
            error={addFieldErrors.name}
          />
          <Input
            type="text"
            label="Industry"
            name="industry"
            value={addForm.industry}
            onChange={onChange}
            error={addFieldErrors.industry}
          />
          <Input
            type="email"
            label="Email"
            name="email"
            value={addForm.email}
            onChange={onChange}
            error={addFieldErrors.email}
          />
          <Input
            type="text"
            label="Phone"
            name="phone"
            value={addForm.phone}
            onChange={onChange}
            error={addFieldErrors.phone}
          />

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-select"
              value={addForm.role}
              onChange={onChange}
            >
              <option value="client">Client</option>
              {currentUserRole === "super_admin" && (
                <option value="admin">Admin</option>
              )}
            </select>
          </div>
          <small className="text-muted">
            New accounts are created as Inactive by default.
          </small>
          {addError && (
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              {addError}
            </div>
          )}
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button
            type="button"
            className="btn btn-light me-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="button" className="btn btn-success" onClick={onSave}>
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
