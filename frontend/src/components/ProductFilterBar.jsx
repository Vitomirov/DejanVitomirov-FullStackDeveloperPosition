function ProductFilterBar({
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  productsPerPage,
  setProductsPerPage,
}) {
  return (
    <div className="filter-search-section">
      <div className="filter-group">
        <label htmlFor="category" className="filter-label">
          Traži po kategoriji:
        </label>
        {/* Category filter dropdown */}
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
        {/* Search input field */}
        <input
          type="text"
          id="search"
          className="filter-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="monitor, samsung..."
        />
      </div>

      {/* Products per page filter */}
      <div className="filter-group">
        <label htmlFor="productsPerPage" className="filter-label">
          Proizvoda po stranici:
        </label>
        {/* Dropdown for products per page selection */}
        <select
          id="productsPerPage"
          className="filter-select"
          value={productsPerPage}
          onChange={(e) => setProductsPerPage(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>
    </div>
  );
}

export default ProductFilterBar;
