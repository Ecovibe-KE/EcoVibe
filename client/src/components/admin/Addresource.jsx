import React from "react";
import Input from "../../utils/Input.jsx";
import Button from "../../utils/Button.jsx";

const AddResourceModal = ({
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
      <div className="bg-white rc-modal rc-modal-scrollable">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Add Resource</h6>
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
            label="Resource Title"
            name="title"
            value={form.title}
            onChange={onChange}
            error={errors.title}
          />
          <div className="mb-3">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              className="form-control"
              value={form.description || ""}
              onChange={onChange}
              rows={3}
            />
            {errors.description && (
              <div className="text-danger">{errors.description}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="file">
              File Upload
            </label>
            <input
              type="file"
              name="file"
              id="file"
              className="form-control"
              onChange={onChange}
            />
            {errors.file && <div className="text-danger">{errors.file}</div>}
          </div>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button className="" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="" onClick={onSave}>
            Save Resource
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceModal;
