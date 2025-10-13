// BookingForm.jsx
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Button from "../utils/Button";
import Input, { Select, Option } from "../utils/Input";
import BookingModal from "./BookingModal";

const BookingForm = ({
  onSubmit,
  initialData = {},
  onClose,
  clients = [],
  services = [],
  disableService = false,
}) => {
  const { user, isAtLeastAdmin } = useAuth();

  // Manage booking form state - now includes status for admins
  const [form, setForm] = useState({
    start_time: "",
    service_id: "",
    client_id: "",
    status: "pending", // Default status
  });

  const [errors, setErrors] = useState({});

  // Track initial data to re-initialize form if props change
  const initialDataRef = useRef(initialData);
  const hasInitialized = useRef(false);

  // Sync form with new initial data
  useEffect(() => {
    const isInitialDataChanged =
      JSON.stringify(initialData) !== JSON.stringify(initialDataRef.current);

    if (!hasInitialized.current || isInitialDataChanged) {
      console.log("Initial data received:", initialData);

      // Helper: format date string into ISO datetime suitable for input[type=datetime-local]
      const formatDateTimeForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const timezoneOffset = date.getTimezoneOffset() * 60000;
          const adjustedDate = new Date(date.getTime() - timezoneOffset);
          return adjustedDate.toISOString().slice(0, 16);
        } catch (error) {
          console.error("Error formatting datetime:", error);
          return "";
        }
      };

      // If user isn't admin, default client_id to the logged-in user
      const autoClientId = !isAtLeastAdmin && user ? user.id.toString() : "";

      // Populate form state
      setForm({
        start_time: formatDateTimeForInput(initialData.start_time),
        service_id: initialData.service_id?.toString() || "",
        client_id:
          initialData.client_id?.toString() ||
          autoClientId ||
          (isAtLeastAdmin ? "" : initialData.client_id?.toString()),
        status: initialData.status || "pending", // Set status from initial data or default
      });

      initialDataRef.current = initialData;
      hasInitialized.current = true;
    }
  }, [initialData, isAtLeastAdmin, user]);

  // Handle input changes and clear related errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!form.start_time) {
      newErrors.start_time = "Appointment date and time is required";
    } else {
      const start = new Date(form.start_time);
      const now = new Date();
      if (start < now) {
        newErrors.start_time =
          "Appointment date and time cannot be in the past";
      }
    }

    if (!form.service_id) {
      newErrors.service_id = "Service is required";
    }

    if (isAtLeastAdmin && !form.client_id) {
      newErrors.client_id = "Client is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit - validate, clean data, then send to parent
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data before submission:", form);

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    // Prepare data for backend
    const formattedData = {
      start_time: form.start_time
        ? new Date(form.start_time).toISOString()
        : undefined,
      service_id: form.service_id ? parseInt(form.service_id, 10) : undefined,
    };

    // Only include client_id if user is admin and it's provided
    if (isAtLeastAdmin && form.client_id) {
      formattedData.client_id = parseInt(form.client_id, 10);
    }

    // Include status for admin users
    if (isAtLeastAdmin && form.status) {
      formattedData.status = form.status;
    }

    // Remove undefined fields
    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    console.log("Form data after formatting:", formattedData);
    onSubmit(formattedData);
  };

  // Show readable client name for non-admins
  const getCurrentClientName = () => {
    if (!isAtLeastAdmin && user) {
      return user.name || user.email || "Current User";
    }
    return "";
  };

  return (
    <BookingModal
      title={initialData.id ? "Edit Booking" : "New Booking"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {/* Client selector (admin) or static display (user) */}
        {isAtLeastAdmin ? (
          <Select
            label="Client"
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            error={errors.client_id}
            required
          >
            <Option value="">Select client</Option>
            {clients.map((client) => (
              <Option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </Option>
            ))}
          </Select>
        ) : (
          <div className="mb-3">
            <label className="form-label fw-bold">Client</label>
            <div className="p-2 border rounded bg-light">
              <i className="bi bi-person-fill me-2 text-primary"></i>
              {getCurrentClientName()}
              <small className="text-muted d-block">
                Booking as current user
              </small>
            </div>
            <input type="hidden" name="client_id" value={form.client_id} />
          </div>
        )}

        {/* Date/time selector */}
        <Input
          label="Appointment Date and Time"
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
          error={errors.start_time}
          required
        />

        {/* Service selection */}
        <Select
          label="Service"
          name="service_id"
          value={form.service_id}
          onChange={handleChange}
          error={errors.service_id}
          required
          disabled={disableService}
        >
          <Option value="">
            {services.length === 0 ? "Loading services..." : "Select service"}
          </Option>
          {services.map((service) => (
            <Option key={service.id} value={service.id}>
              {service.title} - {service.currency} {service.price} (
              {service.duration})
            </Option>
          ))}
        </Select>

        {/* Booking status (admins only) */}
        {isAtLeastAdmin && (
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            error={errors.status}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        )}

        {/* Info message about automatic duration calculation */}
        <div className="alert alert-info mt-3">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            The appointment duration will be automatically calculated based on
            the selected service.
          </small>
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-2 mt-3">
          <Button action="add" label="Save" type="submit" />
          <Button action="cancel" label="Cancel" onClick={onClose} />
        </div>
      </form>
    </BookingModal>
  );
};

export default BookingForm;
