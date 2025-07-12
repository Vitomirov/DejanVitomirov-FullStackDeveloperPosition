import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./services/AuthContext.jsx";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage.jsx";
import BackToTop from "./components/BackToTop.jsx";
import Navbar from "./components/Navbar.jsx";

// Main AppContent component, handles top-level routing and authentication display logic
function AppContent() {
  const { isAuthenticated, loading, error } = useAuth(); // Destructure auth states
  const [currentPage, setCurrentPage] = useState("products"); // State for current active page

  // Effect to handle redirection based on authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage("login"); // Redirect to login if not authenticated
    } else {
      // If authenticated and currently on login page, redirect to products
      if (currentPage === "login") {
        setCurrentPage("products");
      }
    }
  }, [isAuthenticated, currentPage]); // Dependencies for this effect

  // Handle page navigation (simple routing for now)
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render content based on loading, error, and authentication status
  let contentToRender;
  if (loading) {
    // Show global loading message during authentication check
    contentToRender = (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Učitavanje...</div>
      </div>
    );
  } else if (error && currentPage === "login") {
    // Show login page with error message if authentication failed on login
    contentToRender = (
      <LoginPage navigateTo={navigateTo} errorMessage={error} />
    );
  } else if (!isAuthenticated) {
    // Render login page if user is not authenticated
    contentToRender = <LoginPage navigateTo={navigateTo} />;
  } else {
    // Render authenticated content based on current page
    switch (currentPage) {
      case "products":
        contentToRender = <ProductsPage navigateTo={navigateTo} />;
        break;
      // Add other page components here if needed for different routes
      default:
        contentToRender = <ProductsPage navigateTo={navigateTo} />; // Default to products page
    }
  }

  return (
    <div className="app-container">
      {/* Render Navbar only if user is authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Main content area where pages are rendered */}
      <main className="main-content">{contentToRender}</main>

      {/* Render BackToTop component only if user is authenticated */}
      {isAuthenticated && <BackToTop />}
    </div>
  );
}

// App component, responsible for providing the AuthContext to the entire application
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
