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
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState({
    booking_date: "",
    start_time: "",
    end_time: "",
    status: "pending",
    service_id: "",
    client_id: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Initial data received:", initialData);

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          return date.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      };

      const formatDateTimeForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          // Adjust for timezone offset to display correctly in datetime-local input
          const timezoneOffset = date.getTimezoneOffset() * 60000;
          const adjustedDate = new Date(date.getTime() - timezoneOffset);
          return adjustedDate.toISOString().slice(0, 16);
        } catch (error) {
          console.error("Error formatting datetime:", error);
          return "";
        }
      };

      // Auto-set client_id for non-admin users
      const autoClientId = !isAdmin && user ? user.id.toString() : "";

      setForm({
        booking_date: formatDateForInput(initialData.booking_date),
        start_time: formatDateTimeForInput(initialData.start_time),
        end_time: formatDateTimeForInput(initialData.end_time),
        status: initialData.status || "pending",
        service_id: initialData.service_id?.toString() || "",
        client_id:
          initialData.client_id?.toString() ||
          autoClientId ||
          (isAdmin ? "" : initialData.client_id?.toString()),
      });
    } else {
      // Auto-set client_id for new bookings by non-admin users
      if (!isAdmin && user) {
        setForm((prev) => ({
          ...prev,
          client_id: user.id.toString(),
        }));
      }
    }
  }, [initialData, isAdmin, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.booking_date) newErrors.booking_date = "Booking date is required";
    if (!form.start_time) newErrors.start_time = "Start time is required";
    if (!form.end_time) newErrors.end_time = "End time is required";
    if (!form.service_id) newErrors.service_id = "Service is required";

    // Only validate client_id for admin users (non-admin users have it auto-set)
    if (isAdmin && !form.client_id) {
      newErrors.client_id = "Client is required";
    }

    if (form.start_time && form.end_time) {
      const start = new Date(form.start_time);
      const end = new Date(form.end_time);
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    if (form.booking_date) {
      const bookingDate = new Date(form.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        newErrors.booking_date = "Booking date cannot be in the past";
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

    // Remove empty fields
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
  console.log("Clients available:", clients);
  console.log("Services available:", services);

  // Get current client name for display
  const getCurrentClientName = () => {
    if (!isAdmin && user) {
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
        {/* Client Selection - Only show for admins */}
        {isAdmin ? (
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
          /* Display current user info for non-admin clients */
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
          label="Booking Date"
          type="date"
          name="booking_date"
          value={form.booking_date}
          onChange={handleChange}
          error={errors.booking_date}
          required
        />

        <Input
          label="Start Time"
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
          error={errors.start_time}
          required
        />

        <Input
          label="End Time"
          type="datetime-local"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
          error={errors.end_time}
          required
        />

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
