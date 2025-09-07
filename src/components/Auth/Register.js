import React, { useState } from "react";
import "../../styles/Auth.css";

const Register = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords are not matching!");
      return;
    }
    if (formData.username && formData.email && formData.password) {
      onRegister(formData.username);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registruj se</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />
          <button type="submit">Register</button>
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
