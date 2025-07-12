import useProductFilters from "../hooks/useProductFilters.jsx";
import useProductsData from "../hooks/useProductsData.jsx";
import useProductDetailModal from "../hooks/useProductDetailModal.jsx";
import ProductFilterBar from "../components/ProductFilterBar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import PaginationControls from "../components/PaginationControls.jsx";

function ProductsPage({ navigateTo }) {
  // Use custom hook for managing product filters and pagination states
  const {
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    debouncedCategoryFilter,
    debouncedSearchQuery,
    currentPage,
    totalPages,
    setTotalPages,
    productsPerPage,
    setProductsPerPage,
    handlePageChange,
  } = useProductFilters();

  // Use custom hook for fetching product data (list)
  const {
    products,
    loading, // loading from list fetch
    error, // error from list fetch
  } = useProductsData(
    {
      debouncedCategoryFilter,
      debouncedSearchQuery,
      currentPage,
      productsPerPage,
      setTotalPages,
    },
    navigateTo
  );

  // Use custom hook for managing product detail modal
  const {
    selectedProduct,
    handleProductClick,
    handleCloseModal,
    modalLoading, // Separate loading for modal fetch
    modalError, // Separate error for modal fetch
  } = useProductDetailModal(navigateTo);

  // Determine overall loading and error states for display
  const overallLoading = loading || modalLoading;
  const overallError = error || modalError;

  return (
    <div className="products-page-container">
      <div className="products-page-content">
        <h2 className="products-title">Naši proizvodi</h2>

        {/* Product filter bar component */}
        <ProductFilterBar
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          productsPerPage={productsPerPage}
          setProductsPerPage={setProductsPerPage}
        />

        {/* Conditional rendering for loading, error, or product display */}
        {overallLoading && !selectedProduct ? (
          <div className="loading-container">
            <div className="loading-text">Učitavanje ...</div>
          </div>
        ) : overallError && !selectedProduct ? (
          <div className="error-message-container">
            <div className="error-message-card">
              <strong>Greška:</strong>
              <span>{overallError}</span>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Product grid display */}
            <ProductGrid
              products={products}
              onProductClick={handleProductClick}
            />

            {/* Pagination controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="no-products-message">
            Nema proizvoda koji odgovaraju filterima.
          </div>
        )}

        {/* Product detail modal, conditionally rendered */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
