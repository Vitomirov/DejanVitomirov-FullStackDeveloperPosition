import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("jwtToken", data.token);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Login error in AuthContext:", err);
      return { success: false, error: err.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setToken(null);
    setIsAuthenticated(false);
  };

  const authContextValue = {
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
