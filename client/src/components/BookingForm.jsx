import { useState, useEffect } from "react";
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
  const { user, isAdmin, isSuperAdmin, isAtLeastAdmin } = useAuth();
  const [form, setForm] = useState({
    start_time: "",
    status: "pending",
    service_id: "",
    client_id: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Initial data received:", initialData);

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

      const autoClientId = !isAtLeastAdmin && user ? user.id.toString() : "";

      setForm({
        start_time: formatDateTimeForInput(initialData.start_time),
        status: initialData.status || "pending",
        service_id: initialData.service_id?.toString() || "",
        client_id:
          initialData.client_id?.toString() ||
          autoClientId ||
          (isAtLeastAdmin ? "" : initialData.client_id?.toString()),
      });
    } else {
      if (!isAtLeastAdmin && user) {
        setForm((prev) => ({
          ...prev,
          client_id: user.id.toString(),
        }));
      }
    }
  }, [initialData, isAtLeastAdmin, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.start_time) newErrors.start_time = "Appointment date and time is required";
    if (!form.service_id) newErrors.service_id = "Service is required";

    if (isAtLeastAdmin && !form.client_id) {
      newErrors.client_id = "Client is required";
    }

    if (form.start_time) {
      const start = new Date(form.start_time);
      const today = new Date();
      if (start < today) {
        newErrors.start_time = "Appointment date and time cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data before submission:", form);

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    const formattedData = {
      ...form,
      service_id: form.service_id ? parseInt(form.service_id, 10) : undefined,
      client_id: form.client_id ? parseInt(form.client_id, 10) : undefined,
    };

    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] === "" || formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    console.log("Form data after formatting:", formattedData);
    onSubmit(formattedData);
  };

  console.log("Current form state:", form);
  console.log("Current user:", user);
  console.log("Is admin:", isAdmin);
  console.log("Is super admin:", isSuperAdmin);
  console.log("Is at least admin:", isAtLeastAdmin);
  console.log("Clients available:", clients);
  console.log("Services available:", services);

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
        {/* Client Selection - Show for both Admin and Super Admin */}
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

        <Input
          label="Appointment Date and Time"
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
          error={errors.start_time}
          required
        />

        {/* Status Selection - Only for Admin and Super Admin */}
        {isAtLeastAdmin && (
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        )}

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
              {service.title} - {service.currency} {service.price}
            </Option>
          ))}
        </Select>

        <div className="d-flex gap-2 mt-3">
          <Button action="add" label="Save" type="submit" />
          <Button action="cancel" label="Cancel" onClick={onClose} />
        </div>
      </form>
    </BookingModal>
  );
};

export default BookingForm;