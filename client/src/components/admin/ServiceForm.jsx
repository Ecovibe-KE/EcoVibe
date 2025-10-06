import { Container, Form } from "react-bootstrap";
import Input from "../../utils/Input";
import Button from "../../utils/Button";

function ServiceForm({
  formTitle,
  formData,
  handleSubmit,
  handleChange,
  handleFileChange,
  fileInputRef,
  resetForm,
  previewUrl,
  isEditing = false,
  fileInputKey,
}) {
  return (
    <Container>
      <h2>{formTitle}</h2>
      <hr />

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Service Title"
          name="serviceTitle"
          placeholder="Enter Service Title"
          value={formData.serviceTitle}
          onChange={handleChange}
          required
        />

        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label> Service Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter Service Description"
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Input
          type="text"
          label="Price Currency"
          name="priceCurrency"
          placeholder="Enter Price Currency"
          value={formData.priceCurrency}
          onChange={handleChange}
          required
        />

        <Input
          type="number"
          label="Price"
          name="servicePrice"
          placeholder="Enter Service Price"
          min="0"
          value={formData.servicePrice}
          onChange={handleChange}
          required
        />

        <p>Duration</p>
        <div className="d-flex align-items-center">
          <p className="me-2">Hours:</p>
          <Input
            type="number"
            name="durationHours"
            min="0"
            max="24"
            className="me-4"
            value={formData.serviceDuration.hours}
            onChange={handleChange}
            required
          />
          <p className="me-2">Minutes:</p>
          <Input
            type="number"
            name="durationMinutes"
            min="0"
            max="59"
            value={formData.serviceDuration.minutes}
            onChange={handleChange}
            required
          />
        </div>

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Service Image</Form.Label>
          <Form.Control
            type="file"
            name="serviceImage"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            required={!isEditing}
            key={fileInputKey}
            data-max-size="5MB"
          />
          <small className="form-text text-muted">
            Accepted: JPEG, PNG, GIF. Maximum file size: 5MB
          </small>
        </Form.Group>

        {previewUrl && (
          <div className="mb-3">
            <strong>Preview:</strong>
            <br />
            <img src={previewUrl} alt="Preview" style={{ maxWidth: 200 }} />
          </div>
        )}

        <Form.Group className="mb-3" controlId="formServiceStatus">
          <Form.Label>Service Status</Form.Label>
          <Form.Select
            aria-label="Select Service Status"
            name="serviceStatus"
            value={formData.serviceStatus}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button
            type="button"
            color="#e74c3c"
            hoverColor="#c0392b"
            onClick={resetForm}
          >
            Cancel
          </Button>
          <Button type="submit" color="#37b137" hoverColor="#2a6e2aff">
            Save Service
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default ServiceForm;
