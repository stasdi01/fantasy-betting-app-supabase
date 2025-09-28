// Form validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return "Email is required";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return null;
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;

  if (!username) {
    return "Username is required";
  }
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  if (username.length > 20) {
    return "Username must be less than 20 characters long";
  }
  if (!usernameRegex.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

export const validateStake = (stake, availableBudget) => {
  if (!stake || stake <= 0) {
    return "Stake must be greater than 0";
  }
  if (stake < 1) {
    return "Minimum stake is 1%";
  }
  if (stake > availableBudget) {
    return `Stake cannot exceed your available budget (${availableBudget.toFixed(1)}%)`;
  }
  if (stake > 100) {
    return "Maximum stake is 100%";
  }
  return null;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const validator = validationRules[field];
    const value = formData[field];

    if (typeof validator === 'function') {
      // For confirmPassword, pass both the value and the entire formData
      const error = field === 'confirmPassword'
        ? validator(value, formData)
        : validator(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Pre-defined validation rule sets
export const loginValidationRules = {
  username: validateUsername,
  password: (password) => !password ? "Password is required" : null
};

export const registerValidationRules = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
  confirmPassword: (confirmPassword, formData) =>
    validateConfirmPassword(formData?.password, confirmPassword)
};

export const stakeValidationRules = {
  stake: (stake, availableBudget) => validateStake(stake, availableBudget)
};

export const profileValidationRules = {
  username: validateUsername,
  email: validateEmail
};