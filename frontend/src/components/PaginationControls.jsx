function PaginationControls({ currentPage, totalPages, onPageChange }) {
  // Function to render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 4;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjusting the range if it's at the beginning or end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Adding the button for the first page if it's not in range
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="pagination-button"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="pagination-dots">
            ...
          </span>
        );
      }
    }

    // Adding buttons for the current range of pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    // Adding the button for the last page if it's not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="pagination-dots">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="pagination-button"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  if (totalPages <= 1) {
    return null; // Do not display pagination if there is only one or no pages
  }

  return (
    <div className="pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Prethodna
      </button>
      {renderPaginationButtons()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Sledeća
      </button>
    </div>
  );
}

export default PaginationControls;
