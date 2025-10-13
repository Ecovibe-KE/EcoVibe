import { Link } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useState, useEffect, useRef } from "react";
import Input from "../utils/Input";
import { toast } from "react-toastify";
import Button from "../utils/Button";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import "../css/signup.css";
import { createUser } from "../api/services/auth";
import { validateEmail } from "../utils/Validations";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [, setPasswordTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    otherIndustry: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    receiveEmails: false,
    privacyPolicy: false,
  });

  // ----------------------
  // Load reCAPTCHA site key
  // ----------------------
  useEffect(() => {
    const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
    setSiteKey(key);
    if (!key) {
      toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
    }
  }, []);

  useEffect(() => {
    if (formData.industry !== "other" && formData.otherIndustry) {
      setFormData((prev) => ({ ...prev, otherIndustry: "" }));
    }
  }, [formData.industry]);

  // ----------------------
  // Password validator
  // ----------------------
  const validatePassword = (value) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasMinLength && hasUppercase && hasNumber;
  };

  // ----------------------
  // Validate form
  // ----------------------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.industry) newErrors.industry = "Please select your industry";
    if (formData.industry === "other" && !formData.otherIndustry.trim()) {
      newErrors.otherIndustry = "Please specify your industry";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include one uppercase letter and one number";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------
  // Handle input changes
  // ----------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
    setPasswordTouched(true);
  };

  // ----------------------
  // Handle form submit
  // ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    if (!recaptchaRef.current) {
      toast.error(
        "reCAPTCHA not loaded. Please refresh the page and try again.",
      );
      return;
    }

    const captchaToken = recaptchaRef.current.getValue();
    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA challenge.");
      return;
    }

    try {
      setIsSubmitting(true);

      const finalIndustry =
        formData.industry === "other"
          ? formData.otherIndustry
          : formData.industry;

      const payload = {
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        industry: finalIndustry,
        phone_number: formData.phone,
        recaptchaToken: captchaToken,
      };

      const response = await createUser(payload);

      if (response.status === "success") {
        // ✅ Show inline success
        setSuccessMessage(
          response.message || "An activation link has been sent to your email.",
        );

        // reset form
        setFormData({
          name: "",
          industry: "",
          otherIndustry: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          receiveEmails: false,
          privacyPolicy: false,
        });
        setErrors({});
        setPasswordTouched(false);
        if (recaptchaRef.current) recaptchaRef.current.reset();
      } else {
        toast.error(
          response.message || "There was an error submitting your form.",
        );
        if (recaptchaRef.current) recaptchaRef.current.reset();
      }
    } catch (error) {
      console.error(error);
      const backendMessage =
        error.response?.data?.message || error.message || null;
      toast.error(
        backendMessage || "An unexpected error occurred. Please try again.",
      );
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <section className="container-fluid justify-content-center align-items-center signup-form-section p-md-3 p-lg-5">
      <div className="row">
        {/* Left side */}
        <div className="col-lg-6 col-12 text-dark d-flex flex-column justify-content-center align-items-center p-3 p-lg-5 mb-0">
          <h4 className="mb-3 register-text fw-bold fs-1">Ecovibe</h4>
          <h2 className="mb-0 mb-lg-4 fs-3 text-light">
            Empowering Sustainable Solutions
          </h2>
          <div className="d-none d-lg-block">
            <img src="/3826376 1.png" alt="Ecovibe" className="img-fluid" />
          </div>
        </div>

        {/* Right side */}
        <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center p-5">
          <div className="bg-white text-dark p-4 rounded-4 shadow w-100">
            <h2 className="mb-4 fw-bold fs-4">Sign up now</h2>

            {/* ✅ Inline success message styled with EcoVibe green */}
            {successMessage && (
              <div
                className="p-3 rounded-3 mb-3 text-white fw-semibold"
                style={{ backgroundColor: "#37B137" }}
                role="alert"
              >
                {successMessage}
                <div className="mt-2">
                  <Link
                    to="/login"
                    className="btn btn-light btn-sm rounded-pill"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name & Industry */}
              <div className="row">
                <div className="mb-3 col-6">
                  <Input
                    type="text"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="industry">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`form-select ${errors.industry ? "is-invalid" : ""}`}
                    required
                  >
                    <option value="" disabled>
                      Select your industry
                    </option>
                    <option value="finance">Finance</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="energy">Energy</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.industry === "other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="otherIndustry"
                        placeholder="Please specify your industry"
                        value={formData.otherIndustry || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.otherIndustry ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.otherIndustry && (
                        <div className="invalid-feedback">
                          {errors.otherIndustry}
                        </div>
                      )}
                    </div>
                  )}
                  {errors.industry && (
                    <div className="invalid-feedback">{errors.industry}</div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <Input
                  type="email"
                  label="Email address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label" htmlFor="phone">
                  Phone number
                </label>
                <PhoneInput
                  defaultCountry="ke"
                  value={formData.phone}
                  onChange={(phone) =>
                    setFormData((prev) => ({ ...prev, phone }))
                  }
                  inputClassName={`w-100 custom-phone-input-text${
                    errors.phone ? "is-invalid" : ""
                  }`}
                  inputProps={{
                    name: "phone",
                    required: true,
                    id: "phone",
                  }}
                />
                {errors.phone && (
                  <div className="invalid-feedback d-block">{errors.phone}</div>
                )}
              </div>

              {/* Password */}
              <div className="d-flex justify-content-between form-label">
                <label htmlFor="password" className="form-label mb-0">
                  Password
                </label>
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted mb-0 text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <div className="d-flex gap-1 text-muted mb-0">
                      <VisibilityOff /> <span>Hide</span>
                    </div>
                  ) : (
                    <div className="d-flex gap-1 text-muted mb-0">
                      <Visibility /> <span>Show</span>
                    </div>
                  )}
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={formData.password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
                error={errors.password}
              />

              {/* Confirm Password */}
              <div className="mb-3">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  error={errors.confirmPassword}
                />
              </div>

              {/* Privacy Policy */}
              <div className="form-check mb-2">
                <input
                  name="privacyPolicy"
                  className={`form-check-input ${errors.privacyPolicy ? "is-invalid" : ""}`}
                  type="checkbox"
                  id="privacyPolicy"
                  checked={formData.privacyPolicy}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label" htmlFor="privacyPolicy">
                  I agree to the{" "}
                  <Link to="/terms" className="text-decoration-none">
                    Terms of use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-decoration-none">
                    Privacy Policy
                  </Link>
                </label>
                {errors.privacyPolicy && (
                  <div className="invalid-feedback d-block">
                    {errors.privacyPolicy}
                  </div>
                )}
              </div>

              {/* Marketing opt-in */}
              <div className="form-check mb-3">
                <input
                  name="receiveEmails"
                  className="form-check-input"
                  type="checkbox"
                  id="receiveEmails"
                  checked={formData.receiveEmails}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="receiveEmails">
                  By creating an account, I consent to receive SMS messages and
                  emails about updates, events, and promotions.
                </label>
              </div>

              {/* reCAPTCHA */}
              <div className="mb-3">
                {siteKey ? (
                  <ReCAPTCHA sitekey={siteKey} ref={recaptchaRef} />
                ) : (
                  <div className="alert alert-warning">
                    reCAPTCHA is not configured. Please contact Site Owner.
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="d-flex">
                <Button
                  type="submit"
                  className="rounded-pill"
                  hoverColor="none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing up…" : "Sign up"}
                </Button>
                <p className="text-center mt-3">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpForm;
