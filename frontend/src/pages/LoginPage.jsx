import React, { useState } from "react";
import { useAuth } from "../services/AuthContext.jsx";
// No local CSS import here, all styles will be in index.css

function LoginPage({ navigateTo, errorMessage }) {
  const [username, setUsername] = useState("zadatak"); // Pre-fill for convenience
  const [password, setPassword] = useState("zadatak"); // Pre-fill for convenience
  const { login, loading, error } = useAuth(); // Get login function, loading, and error from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigateTo("products"); // Redirect to products page on successful login
    }
    // Error message is handled by AuthContext and passed via props
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {(error || errorMessage) && (
            <div className="error-message" role="alert">
              <strong>Error:</strong>
              <span>{error || errorMessage}</span>
            </div>
          )}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
