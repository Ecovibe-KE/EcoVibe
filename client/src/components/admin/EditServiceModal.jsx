import { Modal, Button } from "react-bootstrap"
import ServiceForm from "./ServiceForm"

function EditServiceModal({
    show,
    handleClose,
    formData,
    handleSubmit,
    handleChange,
    handleFileChange,
    fileInputRef,
    resetForm,
    previewUrl
}) {
    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
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
                        resetForm={resetForm}
                        previewUrl={previewUrl}
                    ></ServiceForm>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary">Understood</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default EditServiceModal