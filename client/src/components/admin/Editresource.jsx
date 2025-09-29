import React, { useState, useEffect } from "react";
import Button from "../../utils/Button.jsx";
import Input from "../../utils/Input.jsx";

const EditResourceModal = ({ visible, resource, onCancel, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    status: "active",
    file: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setForm({
        title: resource.title || "",
        category: resource.category || "",
        status: resource.status || "active",
        file: null,
        author: resource.author || "",
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
    if (!form.author) errors.author = "Author is required";
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
          <Input
            type="text"
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
            error={fieldErrors.author}
          />
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              value={form.description}
              onChange={handleChange}
            />
            {fieldErrors.description && (
              <div className="text-danger small">{fieldErrors.description}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              <option value="esgReports">Esg Reports</option>
              <option value="templates">Templates</option>
              <option value="Policies">Policies</option>
              <option value="sustainability">Sustainability</option>
            </select>
            {fieldErrors.category && (
              <div className="text-danger small">{fieldErrors.category}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>
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
