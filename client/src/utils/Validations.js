export const validateEmail = (value) => {
  if (!value || !value.trim()) return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(value.trim()) ? "" : "Enter a valid email";
};

export const validatePhone = (value) => {
  if (!value || !value.trim()) return "Phone is required";
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? "" : "Enter a valid phone";
};

export const validateName = (value) => {
  if (!value || !value.trim()) return "Name is required";
  return value.trim().length >= 2 ? "" : "Name is too short";
};

export const validateIndustry = (value) => {
  if (!value || !value.trim()) return "Industry is required";
  return value.trim().length >= 2 ? "" : "Industry is too short";
};
