import { useState, useEffect, useCallback } from "react";

function useProductFilters() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedCategoryFilter, setDebouncedCategoryFilter] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);

  // Signal for filter changes (including productsPerPage)
  const [filterChanged, setFilterChanged] = useState(false);

  // Debounce for category filter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedCategoryFilter !== categoryFilter) {
        setDebouncedCategoryFilter(categoryFilter);
        setFilterChanged(true);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [categoryFilter, debouncedCategoryFilter]);

  // Debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearchQuery !== searchQuery) {
        setDebouncedSearchQuery(searchQuery);
        setFilterChanged(true);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Effect to reset page when productsPerPage or debounced filters change
  useEffect(() => {
    // If productsPerPage or any filter changed, set currentPage to 1
    if (filterChanged || currentPage !== 1) {
      setCurrentPage(1);
      resetFilterChangeSignal(); // Reset the filter changed signal
    }
  }, [
    debouncedCategoryFilter,
    debouncedSearchQuery,
    productsPerPage,
    filterChanged,
  ]);

  // Signal filter change when productsPerPage changes
  useEffect(() => {
    setFilterChanged(true);
  }, [productsPerPage]);

  const resetFilterChangeSignal = useCallback(() => {
    setFilterChanged(false);
  }, []);

  // Function to handle page changes
  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  // Return all necessary states and functions
  return {
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    debouncedCategoryFilter,
    debouncedSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    productsPerPage,
    setProductsPerPage,
    filterChanged,
    resetFilterChangeSignal,
    handlePageChange,
  };
}

export default useProductFilters;
