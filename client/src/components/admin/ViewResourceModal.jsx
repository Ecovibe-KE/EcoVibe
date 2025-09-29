import React from "react";
import Button from "../../utils/Button";

const ViewResourceModal = ({ visible, resource, onCancel, onDownload }) => {
  if (!visible || !resource) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rc-modal rc-modal-scrollable"
        style={{ borderRadius: 12, width: "80%", height: "80%" }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">View Resource: {resource.title}</h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          />
        </div>
        <div className="p-3" style={{ height: "calc(100% - 100px)" }}>
          {resource.fileType === "pdf" ? (
            <iframe
              src={resource.fileUrl}
              title={resource.title}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <p>
              Preview not supported for <strong>{resource.fileType}</strong>.
              <br />
              <Button onClick={() => onDownload(resource.id, resource.title)}>
                Download instead
              </Button>
            </p>
          )}
        </div>
        <div className="p-3 border-top d-flex justify-content-end">
          <Button onClick={onCancel}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ViewResourceModal;
