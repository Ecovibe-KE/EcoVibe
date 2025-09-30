export const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="d-flex align-items-center">
    <label
      htmlFor="newsletter-toggle"
      className="form-check-label text-secondary fw-medium me-3"
      style={{ fontSize: "0.875rem" }}
    >
      {label}
    </label>
    <div
      className="form-check form-switch p-0"
      style={{ position: "relative", width: "2.75rem", height: "1.5rem" }}
    >
      <input
        type="checkbox"
        name="toggle"
        id="newsletter-toggle"
        checked={checked}
        onChange={onChange}
        className="form-check-input"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "1.5rem",
          height: "1.5rem",
          margin: 0,
          borderRadius: "50%",
          border: "4px solid white",
          backgroundColor: "white",
          cursor: "pointer",
          transition: "all 0.2s ease-in",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
          appearance: "none",
          zIndex: 2,
        }}
      />
      <label
        htmlFor="newsletter-toggle"
        className="rounded-pill d-block"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: checked ? "#198754" : "#dee2e6",
          transition: "background-color 0.2s ease-in",
          overflow: "hidden",
          cursor: "pointer",
          padding: "2px",
          position: "absolute",
          zIndex: 1,
        }}
      ></label>
      <style jsx="true">{`
        #newsletter-toggle:checked {
          transform: translateX(1.25rem);
          border-color: #198754 !important; /* Bootstrap success color */
        }
        #newsletter-toggle:checked + label {
          background-color: #198754 !important; /* Bootstrap success color */
        }
      `}</style>
    </div>
  </div>
);
