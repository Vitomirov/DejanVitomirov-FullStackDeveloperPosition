import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./services/AuthContext.jsx";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/Productspage.jsx";
import BackToTop from "./components/BackToTop.jsx";

// Main App component
function AppContent() {
  const { isAuthenticated, logout, loading, error } = useAuth();
  const [currentPage, setCurrentPage] = useState("products"); // Default to products page

  // Effect to handle redirection based on authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage("login");
    } else {
      // If authenticated and currently on login page, redirect to products
      if (currentPage === "login") {
        setCurrentPage("products");
      }
    }
  }, [isAuthenticated, currentPage]);

  // Handle page navigation (simple routing for now)
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render content based on authentication status and current page
  let content;
  if (loading) {
    content = (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Učitavanje...</div>
      </div>
    );
  } else if (error && currentPage === "login") {
    // Only show error on login page, other pages will redirect if not authenticated
    content = <LoginPage navigateTo={navigateTo} errorMessage={error} />;
  } else if (!isAuthenticated) {
    content = <LoginPage navigateTo={navigateTo} />;
  } else {
    switch (currentPage) {
      case "products":
        content = <ProductsPage navigateTo={navigateTo} />;
        break;
      // Add other pages here if needed
      default:
        content = <ProductsPage navigateTo={navigateTo} />;
    }
  }

  return (
    <div className="app-container">
      {/* Navigation for authenticated users */}
      {isAuthenticated && (
        <nav className="navbar">
          <img
            src="https://konovo.rs/wp-content/uploads/2023/03/konovo_logo_light.png"
            alt="Konovo Shop Logo"
            className="navbar-logo"
          />
          <button onClick={logout} className="logout-button">
            Odjavi se
          </button>
        </nav>
      )}
      <main className="main-content">{content}</main>
      {/* BackToTop komponenta je sada izvan navbara, ali unutar isAuthenticated bloka */}
      {isAuthenticated && <BackToTop />}
    </div>
  );
}

// Wrap the AppContent with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
