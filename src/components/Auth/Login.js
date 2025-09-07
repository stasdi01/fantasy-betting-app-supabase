import React, { useState } from "react";
import "../../styles/Auth.css";

const Login = ({ onLogin, switchToRegister }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      onLogin(formData.username);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Log In</h2>
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
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button type="submit">Log In</button>
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
