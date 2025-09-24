import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../Loading/LoadingSpinner";
import { validateForm, loginValidationRules } from "../../utils/validation";
import "../../styles/Auth.css";

const Login = ({ switchToRegister }) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateForm(formData, loginValidationRules);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    const { error: signInError } = await signIn(formData.username, formData.password);

    if (signInError) {
      setError(signInError.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Log In</h2>
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
              type="password"
              placeholder="Password"
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
          <button type="submit" disabled={loading} className={loading ? "loading-button" : ""}>
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <span className="button-text">Log In</span>
            )}
          </button>
        </form>
        <p>
          Don't have an account?
          <span onClick={switchToRegister}> Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
