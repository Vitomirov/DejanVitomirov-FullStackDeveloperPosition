import { useState, useCallback } from "react";
import { fetchSingleProduct } from "../services/api";
import { useAuth } from "../services/AuthContext.jsx";

function useProductDetailModal(navigateTo) {
  const { token, isAuthenticated } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Handler to fetch single product details and open the modal
  const handleProductClick = useCallback(
    async (productId) => {
      setModalLoading(true);
      setModalError(null); // Clear previous errors
      try {
        if (!isAuthenticated) {
          navigateTo("login"); // Redirect to login if not authenticated
          return;
        }
        const data = await fetchSingleProduct(token, productId);
        setSelectedProduct(data);
      } catch (err) {
        setModalError(err.message || "Error loading product details");
        console.error("Error fetching single product for modal:", err);
        // If authentication error, redirect to login
        if (
          err.message.includes("Authorization token is missing") ||
          err.message.includes("Unauthorized")
        ) {
          navigateTo("login");
        }
      } finally {
        setModalLoading(false);
      }
    },
    [token, isAuthenticated, navigateTo]
  );

  // Handler to close the product detail modal
  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setModalError(null); // Clear error when closing modal
  }, []);

  return {
    selectedProduct,
    handleProductClick,
    handleCloseModal,
    modalLoading,
    modalError,
  };
}

export default useProductDetailModal;
