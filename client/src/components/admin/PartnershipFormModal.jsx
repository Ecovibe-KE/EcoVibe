import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Input, { Select, FileInput } from "../../utils/Input";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import {
  createPartnership,
  updatePartnership,
} from "../../api/services/partnershipService";
import { toast } from "react-toastify";

const TYPES = ["Funding", "Partnership"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const toInputDate = (value) => (value ? String(value).slice(0, 10) : "");

const emptyForm = {
  title: "",
  type: "Funding",
  description: "",
  image: "",
  launch_date: "",
  deadline_date: "",
};

const PartnershipFormModal = ({ show, onClose, opportunity }) => {
  const isEditing = opportunity != null;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(
        opportunity
          ? {
              title: opportunity.title || "",
              type: opportunity.type || "Funding",
              description: opportunity.description || "",
              image: "",
              launch_date: toInputDate(opportunity.launch_date),
              deadline_date: toInputDate(opportunity.deadline_date),
            }
          : emptyForm,
      );
      setErrors({});
    }
  }, [show, opportunity]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        `Image size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB limit. Please choose a smaller file.`,
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();
    const type = form.type;
    const launchDate = form.launch_date;
    const deadlineDate = form.deadline_date;

    if (!title) nextErrors.title = "Title is required";
    if (!type) nextErrors.type = "Type is required";
    if (!description) nextErrors.description = "Description is required";
    if (!isEditing && !form.image) {
      nextErrors.image = "Program image is required";
    }
    if (!launchDate) nextErrors.launch_date = "Launch date is required";
    if (!deadlineDate) nextErrors.deadline_date = "Deadline date is required";
    if (launchDate && deadlineDate && launchDate > deadlineDate) {
      nextErrors.deadline_date =
        "Launch date cannot be after deadline date";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      launch_date: `${form.launch_date}T00:00:00`,
      deadline_date: `${form.deadline_date}T00:00:00`,
    };

    if (form.image) {
      payload.image = form.image;
    }

    try {
      setIsSubmitting(true);
      let result;
      if (isEditing) {
        result = await updatePartnership(opportunity.id, payload);
        toast.success("Opportunity updated successfully!");
      } else {
        result = await createPartnership(payload);
        toast.success("Opportunity created successfully as Draft.");
      }
      onClose(result?.data);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Failed to save the opportunity. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => onClose()}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold d-flex align-items-center text-dark">
          <NoteAddIcon className="me-2 text-success" />
          {isEditing ? "Edit Opportunity" : "Create Opportunity"}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <Input
                label="Title *"
                type="text"
                id="partnership-title"
                name="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter opportunity title..."
                error={errors.title}
                className="rounded-3 border-light"
                required
              />
            </div>
            <div className="col-md-6">
              <Select
                id="partnership-type"
                name="type"
                label="Type *"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="rounded-3 border-light"
                aria-label="Select type"
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Input
              label="Description *"
              rows={5}
              type="textarea"
              id="partnership-description"
              name="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the opportunity..."
              error={errors.description}
              className="rounded-3 border-light"
              required
            />
          </div>

          <div className="mb-4">
            <FileInput
              type="file"
              id="partnership-image"
              name="image"
              label={isEditing ? "Program Image" : "Program Image *"}
              accept="image/*"
              onChange={handleFileChange}
              error={errors.image}
              className="rounded-3 border-light"
              aria-label="Upload program image"
            />

            {errors.image && (
              <small className="text-danger d-block mt-1">
                {errors.image}
              </small>
            )}

            {form.image ? (
              <div className="mt-2 d-inline-block">
                <img
                  src={form.image}
                  alt="Program image preview"
                  width={160}
                  height={100}
                  className="rounded-3 border"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : isEditing && opportunity?.image ? (
              <div className="mt-2 d-flex align-items-center gap-2">
                <span className="small text-muted">Current image:</span>
                <img
                  src={opportunity.image}
                  alt="Current program image"
                  width={160}
                  height={100}
                  className="rounded-3 border"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : null}

            <small className="text-muted d-block mt-1">
              PNG or JPG, up to 5MB.
              {isEditing && " Leave empty to keep the current image."}
            </small>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <Input
                label="Launch Date *"
                type="date"
                id="partnership-launch-date"
                name="launch_date"
                value={form.launch_date}
                onChange={(e) => updateField("launch_date", e.target.value)}
                error={errors.launch_date}
                className="rounded-3 border-light"
                required
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Deadline Date *"
                type="date"
                id="partnership-deadline-date"
                name="deadline_date"
                value={form.deadline_date}
                onChange={(e) => updateField("deadline_date", e.target.value)}
                error={errors.deadline_date}
                className="rounded-3 border-light"
                required
              />
            </div>
          </div>

          <p className="small text-muted mb-0 mt-3">
            New opportunities are saved as Draft and can be published using the
            status controls.
          </p>
        </Modal.Body>

        <Modal.Footer>
          {isSubmitting && <div className="text-secondary me-3">Saving...</div>}
          <button
            type="button"
            onClick={() => onClose()}
            disabled={isSubmitting}
            className="btn btn-link align-items-center border border-secondary text-secondary fw-semibold text-decoration-none me-3"
          >
            <CancelIcon className="me-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-success fw-semibold rounded-3 shadow-sm px-4 py-2 d-flex align-items-center justify-content-center"
          >
            <SaveAsIcon className="me-1" />
            {isEditing ? "Update Opportunity" : "Create Opportunity"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PartnershipFormModal;