// src/components/PasswordInput.jsx
import React from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import styles from "../css/ForgotPassword.module.css";

const PasswordInput = ({ label, value, onChange, show, setShow, id }) => {
  return (
    <div className={styles.passwordField}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        <button
          type="button"
          className={styles.eyeIcon}
          aria-pressed={show}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setShow(!show)}
        >
          {show ? <VisibilityOff /> : <Visibility />}
        </button>
      </div>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={styles.input}
        required
      />
    </div>
  );
};

export default PasswordInput;
