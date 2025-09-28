import React, { useId } from "react";
import PropTypes from "prop-types";

/**
 * Input component for rendering a customizable input field with optional label, error, and success feedback.
 *
 * @param {Object} props - Component props.
 * @param {'text'|'password'|'email'|'number'|string} [props.type='text'] - The type of input.
 * @param {'sm'|'lg'|undefined} [props.size] - The size of the input ('sm' for small, 'lg' for large).
 * @param {string} [props.borderRadius='0.375rem'] - The border radius of the input.
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper div.
 * @param {string} [props.label] - Optional label to display above the input.
 * @param {string} [props.error] - Error message to display and apply error styles.
 * @param {string} [props.success] - Success message to display and apply success styles.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param props.props - Additional props passed to the input element.
 * @returns {JSX.Element} The rendered input component.
 * Sample Usage
 * <Input
 *                                 type="text"
 *                                 label="Name"
 *                                 name="name"
 *                                 placeholder="Enter your name"
 *                             />
 *
 *                             <Input
 *                                 type="email"
 *                                 label="Email"
 *                                 name="email"
 *                                 placeholder="Enter your email"
 *                             />
 *
 */

/**
 * Input component for rendering a customizable input field with optional label, error, and success feedback.
 */
const Input = ({
  type = "text",
  size,
  borderRadius = "0.375rem",
  className = "",
  label,
  error,
  success,
  disabled = false,
  id: propId,
  ...props
}) => {
  const generatedId = useId();
  const id = propId || generatedId;

  // Base input styles
  const baseStyles = {
    borderRadius: borderRadius,
    transition: "all 0.3s ease",
    width: "100%",
    padding: "0.375rem 0.75rem",
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "#495057",
    backgroundColor: "#fff",
    border: "1px solid #ced4da",
  };

  // Focus styles
  const getFocusStyles = () => {
    if (error) {
      return {
        borderColor: "#dc3545",
        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
      };
    }
    if (success) {
      return {
        borderColor: "#28a745",
        boxShadow: "0 0 0 0.2rem rgba(40, 167, 69, 0.25)",
      };
    }
    return {
      borderColor: "#37b137",
      boxShadow: "0 0 0 0.2rem rgba(55, 177, 55, 0.25)",
    };
  };

  // Error styles
  const errorStyles = {
    borderColor: "#dc3545",
  };

  // Success styles
  const successStyles = {
    borderColor: "#28a745",
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: "0.25rem 0.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    lg: {
      padding: "0.5rem 1rem",
      fontSize: "1.25rem",
      lineHeight: "1.5",
    },
  };

  // Determine size class
  const sizeClass =
    size === "sm" ? "form-control-sm" : size === "lg" ? "form-control-lg" : "";

  // Combine all styles
  const inputStyles = {
    ...baseStyles,
    ...(size && sizeStyles[size]),
    ...(error && errorStyles),
    ...(success && !error && successStyles),
  };

  // Determine aria-describedby
  const ariaDescribedBy = [];
  if (error) ariaDescribedBy.push(`${id}-error`);
  if (success && !error) ariaDescribedBy.push(`${id}-success`);
  const describedBy =
    ariaDescribedBy.length > 0 ? ariaDescribedBy.join(" ") : undefined;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={id}
          className={`form-control ${sizeClass} ${error ? "is-invalid" : ""} ${
            success && !error ? "is-valid" : ""
          }`}
          style={inputStyles}
          onFocus={(e) => {
            Object.assign(e.target.style, getFocusStyles());
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "#dc3545"
              : success && !error
                ? "#28a745"
                : "#ced4da";
            e.target.style.boxShadow = "none";
          }}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          rows={props.rows || 3}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`form-control ${sizeClass} ${error ? "is-invalid" : ""} ${
            success && !error ? "is-valid" : ""
          }`}
          style={inputStyles}
          onFocus={(e) => {
            Object.assign(e.target.style, getFocusStyles());
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "#dc3545"
              : success && !error
                ? "#28a745"
                : "#ced4da";
            e.target.style.boxShadow = "none";
          }}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
      )}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
      {success && !error && (
        <div id={`${id}-success`} className="valid-feedback">
          {success}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  /** Input type (text, email, password, etc.) */
  type: PropTypes.oneOf([
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "search",
    "date",
    "time",
    "textarea",
  ]),
  /** Input size */
  size: PropTypes.oneOf(["sm", "lg"]),
  /** Border radius */
  borderRadius: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Label text */
  label: PropTypes.string,
  /** Error message */
  error: PropTypes.string,
  /** Success message */
  success: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Input ID */
  id: PropTypes.string,
};

export const Select = ({
  size,
  borderRadius = "0.375rem",
  className = "",
  label,
  error,
  success,
  disabled = false,
  id: propId,
  children,
  ...props
}) => {
  const generatedId = useId();
  const id = propId || generatedId;

  // Base select styles
  const baseStyles = {
    borderRadius: borderRadius,
    transition: "all 0.3s ease",
    width: "100%",
    padding: "0.375rem 0.75rem",
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "#495057",
    backgroundColor: "#fff",
    border: "1px solid #ced4da",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1em",
  };

  // Focus styles
  const getFocusStyles = () => {
    if (error) {
      return {
        borderColor: "#dc3545",
        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
      };
    }
    if (success) {
      return {
        borderColor: "#28a745",
        boxShadow: "0 0 0 0.2rem rgba(40, 167, 69, 0.25)",
      };
    }
    return {
      borderColor: "#37b137",
      boxShadow: "0 0 0 0.2rem rgba(55, 177, 55, 0.25)",
    };
  };

  // Error styles
  const errorStyles = {
    borderColor: "#dc3545",
  };

  // Success styles
  const successStyles = {
    borderColor: "#28a745",
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: "0.25rem 0.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    lg: {
      padding: "0.5rem 1rem",
      fontSize: "1.25rem",
      lineHeight: "1.5",
    },
  };

  // Determine size class
  const sizeClass =
    size === "sm" ? "form-select-sm" : size === "lg" ? "form-select-lg" : "";

  // Combine all styles
  const selectStyles = {
    ...baseStyles,
    ...(size && sizeStyles[size]),
    ...(error && errorStyles),
    ...(success && !error && successStyles),
  };

  // Determine aria-describedby
  const ariaDescribedBy = [];
  if (error) ariaDescribedBy.push(`${id}-error`);
  if (success && !error) ariaDescribedBy.push(`${id}-success`);
  const describedBy =
    ariaDescribedBy.length > 0 ? ariaDescribedBy.join(" ") : undefined;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`form-select ${sizeClass} ${
          error ? "is-invalid" : ""
        } ${success && !error ? "is-valid" : ""}`}
        style={selectStyles}
        onFocus={(e) => {
          Object.assign(e.target.style, getFocusStyles());
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "#dc3545"
            : success && !error
              ? "#28a745"
              : "#ced4da";
          e.target.style.boxShadow = "none";
        }}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
      {error && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
      {success && !error && (
        <div id={`${id}-success`} className="valid-feedback">
          {success}
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  /** Input size */
  size: PropTypes.oneOf(["sm", "lg"]),
  /** Border radius */
  borderRadius: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Label text */
  label: PropTypes.string,
  /** Error message */
  error: PropTypes.string,
  /** Success message */
  success: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Select ID */
  id: PropTypes.string,
  /** Select options as children */
  children: PropTypes.node.isRequired,
};

export const Option = ({ value, children }) => (
  <option value={value}>{children}</option>
);

Option.propTypes = {
  /** Option value */
  value: PropTypes.string.isRequired,
  /** Option display text */
  children: PropTypes.node.isRequired,
};

export default Input;
