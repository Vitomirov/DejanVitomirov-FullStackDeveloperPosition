import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext.jsx";
import { fetchProducts, fetchSingleProduct } from "../services/api";

function ProductsPage({ navigateTo }) {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedCategoryFilter, setDebouncedCategoryFilter] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 20;

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategoryFilter(categoryFilter);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [categoryFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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
        setTotalPages(Math.ceil(response.totalProducts / productsPerPage));
      } catch (err) {
        setError(err.message || "Failed to load products");
        console.error("Error fetching products:", err);
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
  ]);

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

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 4;
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

  // Helper Function for Description Formatting
  const formatDescriptionForModal = (descriptionString) => {
    if (!descriptionString) {
      return null;
    }

    let cleanDescription = descriptionString.replace(/^Opis:\s*/, "").trim();

    const allPossibleKeys = [
      "Tip:",
      "Kapacitet:",
      "Povezivanje:",
      "performanse: čitanja:",
      "zapisivanja:",
      "Tip čipa:",
      "Kontroler:",
      "Dijagonala :",
      "Oblik :",
      "Tip ekrana :",
      "Rezolucija :",
      "Osvežavanje :",
      "Osvetljenost :",
      "Vreme odziva :",
      "Description :",
    ];

    let parsedDetails = [];

    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(${allPossibleKeys.map(escapeRegExp).join("|")})`,
      "gi"
    );

    let matches = [];
    let match;
    while ((match = regex.exec(cleanDescription)) !== null) {
      matches.push({ key: match[1], index: match.index });
    }

    matches.sort((a, b) => a.index - b.index);

    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const keyPattern = currentMatch.key;
      const valueStartIndex = currentMatch.index + keyPattern.length;
      let valueEndIndex;

      if (i + 1 < matches.length) {
        valueEndIndex = matches[i + 1].index;
      } else {
        valueEndIndex = cleanDescription.length;
      }

      let value = cleanDescription
        .substring(valueStartIndex, valueEndIndex)
        .trim();

      let displayKey = keyPattern.replace(/:$/, "").trim();
      if (displayKey.includes(":")) {
        displayKey = displayKey
          .split(":")
          .map((s) => s.trim())
          .join(" ");
      }
      displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

      parsedDetails.push({ key: displayKey, value: value });
    }

    if (matches.length > 0 && matches[0].index > 0) {
      const introText = cleanDescription.substring(0, matches[0].index).trim();
      if (introText) {
        parsedDetails.unshift({ key: "Description", value: introText });
      }
    }

    if (
      matches.length > 0 &&
      matches[matches.length - 1].index +
        matches[matches.length - 1].key.length <
        cleanDescription.length
    ) {
      const remainder = cleanDescription
        .substring(
          matches[matches.length - 1].index +
            matches[matches.length - 1].key.length
        )
        .trim();
      if (remainder) {
        parsedDetails.push({ key: "Additional Info", value: remainder });
      }
    }

    if (parsedDetails.length === 0 && cleanDescription) {
      return (
        <p className="modal-description-item">
          <strong>Description:</strong> {cleanDescription}
        </p>
      );
    }

    return parsedDetails.map((item, index) => (
      <p key={index} className="modal-description-item">
        <strong>{item.key}:</strong> {item.value}
      </p>
    ));
  };

  return (
    <div className="products-page-container">
      <div className="products-page-content">
        <h2 className="products-title">Naši proizvodi</h2>

        <div className="filter-search-section">
          <div className="filter-group">
            <label htmlFor="category" className="filter-label">
              Traži po kategoriji:
            </label>
            <select
              id="category"
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="monitor, samsung..."
            />
          </div>
        </div>

        {loading && !selectedProduct ? (
          <div className="loading-container">
            <div className="loading-text">Učitavanje ...</div>
          </div>
        ) : error && !selectedProduct ? (
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
              ))}
            </div>

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
              {/* MODIFIED: Wrapper for side-by-side image and description */}
              <div className="modal-body-row">
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
                <div className="modal-description-container">
                  {formatDescriptionForModal(selectedProduct.description)}
                </div>
              </div>{" "}
              {/* END MODIFIED */}
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
