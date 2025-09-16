import React from "react";
import PropTypes from "prop-types";

/**
 * Custom Button component with green color and orange hover effect.
 *
 * Props:
 * - variant: Button style variant (for compatibility, not used for color).
 * - children: Content inside the button (text, icon, etc.).
 * - onClick: Function called when button is clicked.
 * - type: Button type ('button', 'submit', 'reset').
 * - size: Button size ('sm', 'lg', or default).
 * - disabled: If true, button is disabled.
 * - outline: If true, uses outline style.
 * - borderRadius: CSS value for border radius.
 * - className: Additional CSS classes.
 *
 * Usage:
 * <Button onClick={handleClick} size="lg" outline>
 *   Click Me
 * </Button>
 */
const Button = ({
  variant = "primary",
  children,
  onClick,
  type = "button",
  size,
  disabled = false,
  outline = false,
  borderRadius = "0.375rem",
  className = "",
  ...props
}) => {
  // Custom styles with green color and orange hover
  const customStyles = {
    backgroundColor: "#37b137",
    borderColor: "#37b137",
    borderRadius: borderRadius,
    margin: "0.5rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    color: "#fff",
    transition: "all 0.3s ease",
  };

  const outlineStyles = {
    backgroundColor: "transparent",
    borderColor: "#37b137",
    borderRadius: borderRadius,
    color: "#37b137",
    transition: "all 0.3s ease",
  };

  const hoverStyles = {
    backgroundColor: "#f5a030",
    borderColor: "#f5a030",
    color: "#fff",
  };

  const outlineHoverStyles = {
    backgroundColor: "#f5a030",
    borderColor: "#f5a030",
    color: "#fff",
  };

  // Determine button size class
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      className={`btn ${
        outline ? "btn-outline" : ""
      } ${sizeClass} ${className}`}
      style={outline ? outlineStyles : customStyles}
      onMouseOver={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = outline ? "#f5a030" : "#f5a030";
          e.target.style.borderColor = "#f5a030";
          e.target.style.color = "#fff";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = outline ? "transparent" : "#37b137";
          e.target.style.borderColor = "#37b137";
          e.target.style.color = outline ? "#37b137" : "#fff";
        }
      }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// This defines what types of values each property should be
Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Button variant (for compatibility, but we're using custom colors) */
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ]),
  /** Click handler */
  onClick: PropTypes.func,
  /** Button type */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  /** Button size */
  size: PropTypes.oneOf(["sm", "lg"]),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Outline style */
  outline: PropTypes.bool,
  /** Border radius (any CSS value: px, rem, %, etc.) */
  borderRadius: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Button;
