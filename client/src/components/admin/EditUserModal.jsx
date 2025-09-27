import React from "react";
import Input from "../../utils/Input.jsx";
import Button from "react-bootstrap/Button";

const EditUserModal = ({
  visible,
  form,
  errors,
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
          <h6 className="mb-0">Edit User</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          ></button>
        </div>
        <div className="p-3">
          <Input
            type="text"
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
          />
          <Input
            type="text"
            label="Industry"
            name="industry"
            value={form.industry}
            onChange={onChange}
            error={form.industry}
          />
          <Input
            type="email"
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
          />
          <Input
            type="text"
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            error={errors.phone}
          />
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
