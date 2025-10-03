import { useState, useEffect } from "react";
import Button from "../utils/Button";
import Input, { Select, Option } from "../utils/Input";
import BookingModal from "./BookingModal";

const BookingForm = ({
  onSubmit,
  initialData = {},
  onClose,
  clients = [],
  services = [],
}) => {
  const [form, setForm] = useState({
    booking_date: initialData.booking_date || "",
    start_time: initialData.start_time || "",
    end_time: initialData.end_time || "",
    status: initialData.status || "pending",
    service_id: initialData.service_id || "",
    client_id: initialData.client_id || "",
  });

  useEffect(() => {
    if (initialData) {
      const formatDate = (d) => {
        if (!d) return "";
        const date = new Date(d);
        return date.toISOString().split("T")[0];
      };

      const formatDateTime = (d) => {
        if (!d) return "";
        const date = new Date(d);
        return date.toISOString().slice(0, 16);
      };

      setForm({
        booking_date: formatDate(initialData.booking_date),
        start_time: formatDateTime(initialData.start_time),
        end_time: formatDateTime(initialData.end_time),
        status: initialData.status || "pending",
        service_id: initialData.service_id?.toString() || "",
        client_id: initialData.client_id?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = {
      ...form,
      service_id: form.service_id ? parseInt(form.service_id, 10) : undefined,
      client_id: form.client_id ? parseInt(form.client_id, 10) : undefined,
    };

    onSubmit(formattedData);
  };

  console.log("Clients to render in drop-down:", clients);

  return (
    <BookingModal
      title={initialData.id ? "Edit Booking" : "New Booking"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {clients.length > 0 && (
          <Select
            label="Client"
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
          >
            <Option value="">Select client</Option>
            {clients.map((client) => (
              <Option key={client.id} value={client.id}>
                {client.name}
              </Option>
            ))}
          </Select>
        )}

        <Input
          label="Booking Date"
          type="date"
          name="booking_date"
          value={form.booking_date}
          onChange={handleChange}
        />
        <Input
          label="Start Time"
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
        />
        <Input
          label="End Time"
          type="datetime-local"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
        <Select
          label="Service"
          name="service_id"
          value={form.service_id}
          onChange={handleChange}
          disabled={services.length === 0}
        >
          <Option value="">
            {services.length === 0 ? "Loading services..." : "Select service"}
          </Option>
          {services.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.name}
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
