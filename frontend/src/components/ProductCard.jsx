function ProductCard({ product, onClick }) {
  // Default image placeholder if product image is not available
  const defaultImage = `https://placehold.co/400x300/e0e0e0/333333?text=Proizvod+${product.id}`;

  return (
    // Clickable product card
    <div className="product-card" onClick={() => onClick(product.id)}>
      {/* Product image with fallback for errors */}
      <img
        src={product.image || defaultImage}
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultImage;
        }}
      />
      <div className="product-info">
        {/* Product name */}
        <h3 className="product-name">{product.name}</h3>
        {/* Display truncated description if available */}
        {product.description && (
          <p className="product-description">
            {product.description.length > 100
              ? `${product.description.substring(0, 97)}...`
              : product.description}
          </p>
        )}
        <div className="product-footer">
          {/* Product price */}
          <span className="product-price">
            ${product.price ? product.price.toFixed(2) : "N/A"}
          </span>
          {/* Product category with fallback */}
          <span className="product-category">
            {product.category || "Nekategorisano"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
