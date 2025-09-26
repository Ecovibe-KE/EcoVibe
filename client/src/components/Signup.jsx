import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useState, useEffect } from "react";
import Input from "../utils/Input";
import { useRef } from "react";
import { toast } from "react-toastify";
import Button from "../utils/Button";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "../css/signup.css";
import { createUser } from "../api/services/user";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef();
  const [siteKey, setSiteKey] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    receiveEmails: false,
    privacyPolicy: false,
  });

  // Check if reCAPTCHA key is loaded
  useEffect(() => {
    const key = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
    setSiteKey(key);
    console.log("reCAPTCHA Site Key:", key ? "Loaded" : "Missing");

    if (!key) {
      toast.error("reCAPTCHA site key is missing. Please contact Site Owner.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!recaptchaRef.current) {
      toast.error(
        "reCAPTCHA not loaded. Please refresh the page and try again.",
      );
      return;
    }
    if (!validatePassword(formData.password)) {
      setPasswordTouched(true);
      toast.error(
        "Password must be at least 8 characters and include a letter, a number, and a symbol.",
      );
      return;
    }
    if (!formData.confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }
    if (formData.confirmPassword !== formData.password) {
      toast.error("Passwords do not match.");
      return;
    }
    const captchaToken = recaptchaRef.current.getValue();
    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA challenge.");
      return;
    }
    try {
      try {
        const payload = {
          ...formData,
          recaptchaToken: captchaToken,
        };
        const response = await createUser(payload);
        if (response.ok) {
          toast.success("An activation link was sent to your email address.");
          // Reset form and reCAPTCHA
          setFormData({
            name: "",
            industry: "",
            email: "",
            phone: "254",
            password: "",
            confirmPassword: "",
            receiveEmails: false,
            privacyPolicy: false,
          });
          recaptchaRef.current.reset();
          setIsValidPassword(false);
          setPasswordTouched(false);

          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          toast.error(
            response.message || "There was an error submitting your form.",
          );
          recaptchaRef.current.reset();
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred. Please try again.");
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (value) => {
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    return hasMinLength && hasNumber && hasSymbol && hasLetter;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    setIsValidPassword(validatePassword(value));
  };
  return (
    <section className="container-fluid justify-content-center align-items-center signup-form-section p-md-3 p-lg-5">
      <div className="row">
        <div className="col-lg-6 col-12 text-dark d-flex flex-column justify-content-center align-items-center p-3 p-lg-5 mb-0">
          <h4 className="mb-3 register-text fw-bold fs-1">Ecovibe</h4>
          <h2 className="mb-0 mb-lg-4 fs-3 text-light">
            Empowering Sustainable Solutions
          </h2>
          <div className="d-none d-lg-block">
            <img src="/3826376 1.png" alt="Ecovibe" className="img-fluid" />
          </div>
        </div>
        <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center p-5">
          <div className="bg-white text-dark p-4 rounded-4 shadow w-100">
            <h2 className="mb-4 fw-bold fs-4">Sign up now</h2>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="mb-3 col-6">
                  <Input
                    type="text"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                    className="form-select"
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
                </div>
              </div>
              <div className="mb-3">
                <Input
                  type="email"
                  label="Email address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  inputClassName="w-100 custom-phone-input-text"
                  className="custom-phone-input"
                  inputProps={{
                    name: "phone",
                    required: true,
                    autoFocus: true,
                    id: "phone",
                  }}
                />
              </div>
              <div className="d-flex justify-content-between form-label">
                <label htmlFor="password" className="form-label mb-0">
                  Password
                </label>
                <a
                  className="btn-sm btn-link p-0 text-muted mb-0 text-decoration-none"
                  onClick={() => {
                    handleClickShowPassword();
                  }}
                >
                  {showPassword ? (
                    <div className="d-flex gap-1 text-muted mb-0">
                      <VisibilityOff /> <p className="mb-0">Hide</p>
                    </div>
                  ) : (
                    <div className="d-flex gap-1 text-muted mb-0">
                      <Visibility />
                      <p className="mb-0">Show</p>
                    </div>
                  )}
                </a>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={formData.password}
                onChange={(e) => {
                  handlePasswordChange(e);
                }}
                onBlur={() => setPasswordTouched(true)}
                success={
                  passwordTouched && validatePassword(formData.password)
                    ? " "
                    : undefined
                }
              />
              <div className="mb-3">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  label="confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  success={
                    formData.confirmPassword &&
                    formData.confirmPassword === formData.password
                      ? " "
                      : undefined
                  }
                />
              </div>
              <div className="form-check mb-2">
                <input
                  name="privacyPolicy"
                  className="form-check-input"
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
              </div>
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
                  By creating an account, I am also consenting to receive SMS
                  messages and emails, including product new feature updates,
                  events, and marketing promotions.
                </label>
              </div>
              <div className="">
                {siteKey ? (
                  <ReCAPTCHA sitekey={siteKey} ref={recaptchaRef} />
                ) : (
                  <div className="alert alert-warning">
                    reCAPTCHA is not configured. Please contact Site Owner.
                  </div>
                )}
              </div>
              <div className="d-flex">
                <Button
                  type="submit"
                  className="rounded-pill"
                  hoverColor="none"
                  disabled={isSubmitting || !isValidPassword}
                >
                  Sign up
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
