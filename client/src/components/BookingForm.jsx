// src/components/BookingForm.jsx
import { useState } from "react";
import Button from "../utils/Button";
import Input, { Select, Option } from "../utils/Input";
import BookingModal from "./BookingModal";

const BookingForm = ({ onSubmit, initialData = {}, onClose }) => {
  const [form, setForm] = useState({
    booking_date: initialData.booking_date || "",
    start_time: initialData.start_time || "",
    end_time: initialData.end_time || "",
    status: initialData.status || "pending",
    service_id: initialData.service_id || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <BookingModal
      title={initialData.id ? "Edit Booking" : "New Booking"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
        <Input
          label="Service ID"
          type="number"
          name="service_id"
          value={form.service_id}
          onChange={handleChange}
        />

        <div className="d-flex gap-2 mt-3">
          <Button action="add" label="Save" type="submit" />
          <Button action="cancel" label="Cancel" onClick={onClose} />
        </div>
      </form>
    </BookingModal>
  );
};

export default BookingForm;
