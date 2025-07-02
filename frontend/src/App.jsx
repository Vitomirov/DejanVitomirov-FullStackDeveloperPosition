import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./services/AuthContext.jsx";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/Productspage.jsx";

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
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation for authenticated users */}
      {isAuthenticated && (
        <nav className="bg-blue-600 p-4 shadow-md flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold rounded-md px-2 py-1">
            Konovo Shop
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Logout
          </button>
        </nav>
      )}
      <main className="flex-grow">{content}</main>
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
