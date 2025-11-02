/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import Block from "@mui/icons-material/Block";
import UnBlock from "@mui/icons-material/SettingsBackupRestore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

/**
 * Unified Button component with support for both standard and action buttons.
 * Features customizable colors with a default green/orange scheme.
 *
 * Props for standard buttons:
 * - variant: Button style variant (for compatibility)
 * - children: Content inside the button
 * - onClick: Function called when button is clicked
 * - type: Button type ('button', 'submit', 'reset')
 * - size: Button size ('sm', 'lg', or default)
 * - disabled: If true, button is disabled
 * - outline: If true, uses outline style
 * - borderRadius: CSS value for border radius
 * - className: Additional CSS classes
 * - color: Custom color for the button (overrides default)
 * - hoverColor: Custom hover color (overrides default)
 *
 * Props for action buttons:
 * - action: Type of action ('add', 'update', 'delete', 'view')
 * - label: Text label for action button
 * - showIcon: Whether to show icon (default: true)
 * - icon: Custom icon element
 *
 * Usage:
 * Standard: <Button onClick={handleClick} size="lg">Click Me</Button>
 * Action: <Button action="add" label="Add Item" onClick={handleAdd} />
 */
const Button = ({
  // Standard button props
  variant = "primary",
  children,
  onClick,
  type = "button",
  size,
  disabled = false,
  outline = false,
  borderRadius = "0.375rem",
  className = "",
  color,
  hoverColor,
  hoverTextColor,

  // Action button props
  action,
  label,
  showIcon = true,
  icon,

  ...props
}) => {
  // Default color scheme
  const defaultColor = "#37b137";
  const defaultHoverColor = "#ff8c00";
  const defaultOutlineColor = "#2b2b2bff";

  // Use custom colors if provided, otherwise use defaults
  const btnColor = color || defaultColor;
  const btnHoverColor = hoverColor || defaultHoverColor;
  const btnOutlineColor = color || defaultOutlineColor;

  // Action button configuration
  const actionIcons = {
    add: <AddIcon />,
    update: <EditIcon />,
    delete: <DeleteForeverIcon />,
    block: <Block />,
    unblock: <UnBlock />,
    view: <RemoveRedEyeIcon />,
  };

  const actionVariantMap = {
    add: "success",
    update: "warning",
    delete: "danger",
    block: "light",
    unblock: "light",
    view: "dark",
  };

  // Determine if this is an action button
  const isActionButton = action && label;

  // Base styles for standard button
  const baseStyles = {
    borderRadius: borderRadius,
    margin: "0.5rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid",
    fontWeight: 500,
  };

  // Standard button styles
  const standardStyles = {
    ...baseStyles,
    backgroundColor: outline ? "transparent" : btnColor,
    borderColor: btnColor,
    color: outline ? btnColor : "#fff",
  };

  // Hover effect for standard button
  const standardHoverStyle = {
    backgroundColor: outline ? btnColor : btnHoverColor,
    borderColor: outline ? btnHoverColor : btnHoverColor,
    // Do not override text/icon color on hover for standard button
  };

  // Action button styles (using Bootstrap-like variants)
  const actionStyles = {
    ...baseStyles,
    margin: "2.5px",
  };

  // Determine button size class
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  // Handle action button variant
  let actionVariantClass = "";
  if (isActionButton) {
    const variantBase = actionVariantMap[action];
    actionVariantClass = outline
      ? `btn-outline-${variantBase}`
      : `btn-${variantBase}`;
  }

  // Render action button
  if (isActionButton) {
    const visibleIcon = showIcon ? icon || actionIcons[action] : null;

    return (
      <button
        type={type}
        className={`btn ${actionVariantClass} ${sizeClass} ${className}`}
        style={{
          ...actionStyles,
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        onMouseOver={(e) => {
          if (!disabled) {
            const el = e.currentTarget;
            el.style.backgroundColor = outline ? btnColor : btnHoverColor;
          }
        }}
        onMouseOut={(e) => {
          if (!disabled) {
            const el = e.currentTarget;
            el.style.backgroundColor = outline ? "transparent" : "";
          }
        }}
        {...props}
      >
        {visibleIcon}
        <span style={{ marginLeft: visibleIcon ? "5px" : "0" }}>{label}</span>
      </button>
    );
  }

  // Render standard button
  return (
    <button
      type={type}
      className={`btn ${
        outline ? "btn-outline" : ""
      } ${sizeClass} ${className}`}
      style={{
        ...standardStyles,
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseOver={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, standardHoverStyle);
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          const el = e.currentTarget;
          el.style.backgroundColor = outline ? "transparent" : btnColor;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Prop type validation
Button.propTypes = {
  /** Button content (for standard buttons) */
  children: PropTypes.node,
  /** Button variant */
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
  /** Custom color for the button */
  color: PropTypes.string,
  /** Custom hover color */
  hoverColor: PropTypes.string,
  /** Action type (for action buttons) */
  action: PropTypes.oneOf(["add", "update", "delete", "view"]),
  /** Label text (for action buttons) */
  label: PropTypes.string,
  /** Whether to show icon (for action buttons) */
  showIcon: PropTypes.bool,
  /** Custom icon (for action buttons) */
  icon: PropTypes.element,
  hoverTextColor: PropTypes.string,
};

export default Button;
