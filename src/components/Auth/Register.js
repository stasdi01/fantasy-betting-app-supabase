import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../Loading/LoadingSpinner";
import { validateForm, registerValidationRules } from "../../utils/validation";
import "../../styles/Auth.css";

const Register = ({ switchToLogin }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form using validation rules
    const validation = validateForm(formData, registerValidationRules);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    const { error: signUpError } = await signUp(formData.email, formData.password, formData.username);

    if (signUpError) {
      setError(signUpError.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && (
          <div style={{
            color: 'var(--danger)',
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              disabled={loading}
              className={fieldErrors.username ? "error" : ""}
            />
            {fieldErrors.username && (
              <div className="field-error">{fieldErrors.username}</div>
            )}
          </div>
          <div className="form-field">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={loading}
              className={fieldErrors.email ? "error" : ""}
            />
            {fieldErrors.email && (
              <div className="field-error">{fieldErrors.email}</div>
            )}
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={loading}
              className={fieldErrors.password ? "error" : ""}
            />
            {fieldErrors.password && (
              <div className="field-error">{fieldErrors.password}</div>
            )}
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={loading}
              className={fieldErrors.confirmPassword ? "error" : ""}
            />
            {fieldErrors.confirmPassword && (
              <div className="field-error">{fieldErrors.confirmPassword}</div>
            )}
          </div>
          <button type="submit" disabled={loading} className={loading ? "loading-button" : ""}>
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <span className="button-text">Register</span>
            )}
          </button>
        </form>
        <p>
          Already have an account?
          <span onClick={switchToLogin}> Log In</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
