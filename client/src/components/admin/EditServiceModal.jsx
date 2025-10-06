import { Modal } from "react-bootstrap";
import ServiceForm from "./ServiceForm";

function EditServiceModal({
  showEditServiceModal,
  handleCloseEdit,
  formData,
  handleSubmit,
  handleChange,
  handleFileChange,
  fileInputRef,
  previewUrl,
  resetForm,
  fileInputKey,
}) {
  function resetAfterClose() {
    handleCloseEdit();
    resetForm();
  }

  return (
    <>
      <Modal
        show={showEditServiceModal}
        onHide={resetAfterClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <ServiceForm
            fileInputKey={fileInputKey}
            formTitle="Edit Service"
            formData={formData}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            resetForm={resetAfterClose}
            previewUrl={previewUrl}
            isEditing={true}
          ></ServiceForm>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditServiceModal;
