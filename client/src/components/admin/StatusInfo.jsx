import React from "react";

const StatusInfo = ({ status }) => {
  const palette = {
    Active: { bg: "#e6f7ec", fg: "#2ca24c" },
    Inactive: { bg: "#f1f5f9", fg: "#64748b" },
    Suspended: { bg: "#fff1e6", fg: "#b45309" },
  };
  const { bg, fg } = palette[status] || palette.Inactive;
  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color: fg,
        padding: "8px 12px",
        borderRadius: "9999px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
};

export default StatusInfo;
