import { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext.jsx";
import { fetchProducts } from "../services/api";

function useProductsData(filterParams, navigateTo) {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Destructure filter parameters
  const {
    debouncedCategoryFilter,
    debouncedSearchQuery,
    currentPage,
    productsPerPage,
    setTotalPages, // setTotalPages is provided by useProductFilters, but updated here
  } = filterParams;

  // Effect to fetch products based on filter and pagination changes
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isAuthenticated) {
          navigateTo("login");
          return;
        }

        const response = await fetchProducts(
          token,
          debouncedCategoryFilter,
          debouncedSearchQuery,
          currentPage,
          productsPerPage
        );

        setProducts(response.products);
        // Calculate total pages and update the state in useProductFilters
        setTotalPages(Math.ceil(response.totalProducts / productsPerPage));
      } catch (err) {
        setError(err.message || "Error loading products");
        console.error("Error fetching products list:", err);
        if (
          err.message.includes("Authorization token is missing") ||
          err.message.includes("Unauthorized")
        ) {
          navigateTo("login");
        }
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [
    token,
    isAuthenticated,
    debouncedCategoryFilter,
    debouncedSearchQuery,
    currentPage,
    productsPerPage,
    navigateTo,
    setTotalPages, // Dependency for updating totalPages in useProductFilters
  ]);

  return {
    products,
    loading,
    error,
  };
}

export default useProductsData;
