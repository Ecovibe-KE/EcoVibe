import { Modal, Button } from "react-bootstrap"
import ServiceForm from "./ServiceForm"

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
}) {

    function resetAfterClose() {
        handleCloseEdit()
        resetForm()
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
                <Modal.Header closeButton>

                </Modal.Header>
                <Modal.Body>
                    <ServiceForm
                        formTitle="Edit Service"
                        formData={formData}
                        handleSubmit={handleSubmit}
                        handleChange={handleChange}
                        handleFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                        resetForm={resetAfterClose}
                        previewUrl={previewUrl}
                    ></ServiceForm>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EditServiceModal