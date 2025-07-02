import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext.jsx";
import { fetchProducts, fetchSingleProduct } from "../services/api.js";
// We will not import any local CSS here, all styles will be in index.css

function ProductsPage({ navigateTo }) {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // For single product details

  // Fetch products when component mounts or filters change
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isAuthenticated) {
          navigateTo("login"); // Redirect if not authenticated
          return;
        }
        const data = await fetchProducts(token, categoryFilter, searchQuery);
        setProducts(data);
      } catch (err) {
        setError(err.message || "Failed to load products");
        console.error("Error fetching products:", err);
        if (err.message.includes("Authorization token is missing")) {
          navigateTo("login"); // Redirect to login if token is invalid/missing
        }
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [token, isAuthenticated, categoryFilter, searchQuery, navigateTo]);

  // Fetch single product details
  const handleProductClick = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        navigateTo("login");
        return;
      }
      const data = await fetchSingleProduct(token, productId);
      setSelectedProduct(data);
    } catch (err) {
      setError(err.message || "Failed to load product details");
      console.error("Error fetching single product:", err);
      if (err.message.includes("Authorization token is missing")) {
        navigateTo("login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-container">
        <div className="error-message-card">
          <strong>Error:</strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page-container">
      <div className="products-page-content">
        <h2 className="products-title">Our Products</h2>

        {/* Filter and Search Section */}
        <div className="filter-search-section">
          <div className="filter-group">
            <label htmlFor="category" className="filter-label">
              Filter by Category:
            </label>
            <select
              id="category"
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Monitori">Monitori</option>
              <option value="Tastature">Tastature</option>
              <option value="Miševi">Miševi</option>
              <option value="Slušalice">Slušalice</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search" className="filter-label">
              Search by Name/Description:
            </label>
            <input
              type="text"
              id="search"
              className="filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Gaming, RGB"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
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
            ))
          ) : (
            <div className="no-products-message">
              No products found. Try adjusting your filters.
            </div>
          )}
        </div>

        {/* Product Detail Modal */}
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
