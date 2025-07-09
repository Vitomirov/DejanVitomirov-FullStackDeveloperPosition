import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext.jsx";
import { fetchProducts, fetchSingleProduct } from "../services/api";

function ProductsPage({ navigateTo }) {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for input values (what the user types immediately)
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced states for API calls (these change after a delay)
  const [debouncedCategoryFilter, setDebouncedCategoryFilter] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 20; // Number of products to show per page

  // State for selected product for modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Effect for debouncing category filter input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategoryFilter(categoryFilter);
      setCurrentPage(1); // Reset to first page when filter changes
    }, 500); // 500ms delay before updating the debounced state

    // Cleanup function: clear the timeout if categoryFilter changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [categoryFilter]); // Re-run this effect when categoryFilter changes

  // Effect for debouncing search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search query changes
    }, 500); // 500ms delay before updating the debounced state

    // Cleanup function: clear the timeout if searchQuery changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // Re-run this effect when searchQuery changes

  // Main effect to fetch products when debounced filters/search change, or auth state changes
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isAuthenticated) {
          navigateTo("login"); // Redirect if not authenticated
          return; // Stop execution if not authenticated
        }

        // Use debounced values for the API call to reduce frequency
        // Pass currentPage and productsPerPage to the API
        const response = await fetchProducts(
          token,
          debouncedCategoryFilter,
          debouncedSearchQuery,
          currentPage, // New: current page
          productsPerPage // New: products per page
        );

        // Assuming your backend now returns an object like { products: [...], totalProducts: N }
        setProducts(response.products);
        setTotalPages(Math.ceil(response.totalProducts / productsPerPage)); // Calculate total pages
      } catch (err) {
        setError(err.message || "Failed to load products");
        console.error("Error fetching products:", err);
        // If authorization token is missing or invalid, redirect to login
        if (
          err.message.includes("Authorization token is missing") ||
          err.message.includes("Unauthorized")
        ) {
          navigateTo("login");
        }
      } finally {
        setLoading(false); // End loading after API call (success or failure)
      }
    };

    getProducts();
  }, [
    token,
    isAuthenticated,
    debouncedCategoryFilter,
    debouncedSearchQuery,
    currentPage, // Add currentPage to dependencies
    productsPerPage, // Add productsPerPage to dependencies (if it could change, otherwise optional)
    navigateTo,
  ]); // Dependencies for this effect

  // Function to handle clicking on a product to show details
  const handleProductClick = async (productId) => {
    setLoading(true); // Show loading for modal data fetch
    setError(null); // Clear previous errors
    try {
      if (!isAuthenticated) {
        navigateTo("login");
        return;
      }
      const data = await fetchSingleProduct(token, productId);
      setSelectedProduct(data); // Set the selected product to display in modal
    } catch (err) {
      setError(err.message || "Failed to load product details");
      console.error("Error fetching single product:", err);
      if (
        err.message.includes("Authorization token is missing") ||
        err.message.includes("Unauthorized")
      ) {
        navigateTo("login");
      }
    } finally {
      setLoading(false); // End loading for modal data fetch
    }
  };

  // Function to close the product detail modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 4; // Max number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // Render the main products page content
  return (
    <div className="products-page-container">
      <div className="products-page-content">
        <h2 className="products-title">Naši proizvodi</h2>

        {/* Filter and Search Section - This part is ALWAYS rendered to maintain input focus */}
        <div className="filter-search-section">
          <div className="filter-group">
            <label htmlFor="category" className="filter-label">
              Traži po kategoriji:
            </label>
            <select
              id="category"
              className="filter-select"
              value={categoryFilter} // Binds to non-debounced state for immediate UI update
              onChange={(e) => setCategoryFilter(e.target.value)} // Updates non-debounced state
            >
              <option value="">Svi proizvodi</option>
              <option value="Monitori">Monitori</option>
              <option value="Toneri i potrošni materijal">
                Toneri i potrosni materijal
              </option>
              <option value="Mobilni/Fiksni telefoni i tableti">
                Mobilni/Fiksni telefoni i tableti
              </option>
              <option value="Slušalice">Slušalice</option>
              <option value="Torbe i rančevi">Torbe i rančevi</option>
              <option value="Štampači">Štampači</option>
              <option value="Električni trotineti">Električni trotineti</option>
              <option value="Ostalo">Ostalo</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search" className="filter-label">
              Traži po imenu, opisu:
            </label>
            <input
              type="text"
              id="search"
              className="filter-input"
              value={searchQuery} // Binds to non-debounced state for immediate UI update
              onChange={(e) => setSearchQuery(e.target.value)} // Updates non-debounced state
              placeholder="monitor, samsung..."
            />
          </div>
        </div>

        {/* Conditional rendering for Products Grid, Loading, or Error messages */}
        {loading && !selectedProduct ? ( // Show global loading only if no product modal is open
          <div className="loading-container">
            <div className="loading-text">Učitavanje ...</div>
          </div>
        ) : error && !selectedProduct ? ( // Show global error only if no product modal is open
          <div className="error-message-container">
            <div className="error-message-card">
              <strong>Error:</strong>
              <span>{error}</span>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <div
                  key={product.id} // Ensure product.id is unique and stable
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={
                      product.image ||
                      `https://placehold.co/400x300/e0e0e0/333333?text=Product+${product.id}`
                    }
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/400x300/e0e0e0/333333?text=Product+${product.id}`;
                    }}
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">
                        ${product.price ? product.price.toFixed(2) : "N/A"}
                      </span>
                      <span className="product-category">
                        {product.category || "Uncategorized"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Prethodna
                </button>
                {renderPaginationButtons()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Sledeća
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products-message">
            Nema proizvoda koji odgovaraju filterima.
          </div>
        )}

        {/* Product Detail Modal - Conditionally rendered as an overlay */}
        {selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={handleCloseModal} className="modal-close-button">
                &times;
              </button>
              <h3 className="modal-title">{selectedProduct.name}</h3>
              <img
                src={
                  selectedProduct.image ||
                  `https://placehold.co/600x400/e0e0e0/333333?text=Product+${selectedProduct.id}`
                }
                alt={selectedProduct.name}
                className="modal-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/600x400/e0e0e0/333333?text=Product+${selectedProduct.id}`;
                }}
              />
              <p className="modal-description">{selectedProduct.description}</p>
              <div className="modal-footer">
                <span className="modal-price">
                  $
                  {selectedProduct.price
                    ? selectedProduct.price.toFixed(2)
                    : "N/A"}
                </span>
                <span className="modal-category">
                  {selectedProduct.category || "Uncategorized"}
                </span>
              </div>
              <p className="modal-id">ID: {selectedProduct.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
