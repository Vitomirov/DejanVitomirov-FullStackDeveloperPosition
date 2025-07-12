import ProductCard from "./ProductCard.jsx";

function ProductGrid({ products, onProductClick }) {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
