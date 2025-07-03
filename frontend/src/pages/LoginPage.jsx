import React, { useState } from "react";
import { useAuth } from "../services/AuthContext.jsx";

function LoginPage({ navigateTo, errorMessage }) {
  const [username, setUsername] = useState("zadatak");
  const [password, setPassword] = useState("zadatak");
  const { login, loading, error } = useAuth();

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
      <nav className="navbar sticky-top">
        <img
          src="https://konovo.rs/wp-content/uploads/2023/03/konovo_logo_light.png"
          alt="Konovo Shop Logo"
          className="navbar-logo"
        />
      </nav>
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
