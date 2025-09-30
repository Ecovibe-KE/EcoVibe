import React, { useState, useEffect } from "react";
import Button from "../../utils/Button.jsx";
import Input from "../../utils/Input.jsx";

const EditResourceModal = ({ visible, resource, onCancel, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setForm({
        title: resource.title || "",
        category: resource.category || "",
        file: null,
        description: resource.description || "",
      });
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };
  const handleSubmit = () => {
    let errors = {};
    if (!form.title) errors.title = "Title is required";
    if (!form.description) errors.description = "Description is required";
    if (!form.category) errors.category = "Category is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSave(form);
  };

  if (!visible || !resource) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rc-modal rc-modal-scrollable">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Edit Resource</h6>
          <button type="button" className="btn-close" onClick={onCancel} />
        </div>
        <div className="p-3 ">
          <Input
            type="text"
            label="Resource Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={fieldErrors.title}
          />
          <div className="mb-3">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              className="form-control"
              value={form.description}
              onChange={handleChange}
            />
            {fieldErrors.description && (
              <div className="text-danger small">{fieldErrors.description}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Replace File (optional)</label>
            <input
              type="file"
              name="file"
              className="form-control"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditResourceModal;
