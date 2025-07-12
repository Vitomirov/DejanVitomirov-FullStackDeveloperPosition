function ProductDetailModal({ product, onClose }) {
  if (!product) {
    return null;
  }

  const defaultImage = `https://placehold.co/600x400/e0e0e0/333333?text=Proizvod+${product.id}`;

  const formatDescriptionForModal = (descriptionString) => {
    if (!descriptionString) {
      return null; // Return null if description is empty
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
    // Create regex to find all possible keys in the description
    const regex = new RegExp(
      `(${allPossibleKeys.map(escapeRegExp).join("|")})`,
      "gi"
    );

    let matches = [];
    let match;
    // Find all occurrences of keys
    while ((match = regex.exec(cleanDescription)) !== null) {
      matches.push({ key: match[1], index: match.index });
    }

    matches.sort((a, b) => a.index - b.index); // Sort matches by their index

    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const keyPattern = currentMatch.key;
      const valueStartIndex = currentMatch.index + keyPattern.length;
      let valueEndIndex;

      if (i + 1 < matches.length) {
        valueEndIndex = matches[i + 1].index; // End at the start of the next key
      } else {
        valueEndIndex = cleanDescription.length; // End at the end of the string if no more keys
      }

      let value = cleanDescription
        .substring(valueStartIndex, valueEndIndex)
        .trim();

      // Format key for display
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

    // Handle introductory text before the first key
    if (matches.length > 0 && matches[0].index > 0) {
      const introText = cleanDescription.substring(0, matches[0].index).trim();
      if (introText) {
        parsedDetails.unshift({ key: "Opis", value: introText });
      }
    }

    // Handle any remaining text after the last key
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
        parsedDetails.push({ key: "Dodatne informacije", value: remainder });
      }
    }

    // If no keys were found, return the entire description as one paragraph
    if (parsedDetails.length === 0 && cleanDescription) {
      return (
        <p className="modal-description-item">
          <strong>Opis:</strong> {cleanDescription}
        </p>
      );
    }

    // Render parsed details as paragraphs
    return parsedDetails.map((item, index) => (
      <p key={index} className="modal-description-item">
        <strong>{item.key}:</strong> {item.value}
      </p>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">
          &times;
        </button>
        <h3 className="modal-title">{product.name}</h3>
        <div className="modal-body-row">
          {/* Product image with fallback */}
          <img
            src={product.image || defaultImage}
            alt={product.name}
            className="modal-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          {/* Formatted product description */}
          <div className="modal-description-container">
            {formatDescriptionForModal(product.description)}
          </div>
        </div>
        <div className="modal-footer">
          <span className="modal-price">
            ${product.price ? product.price.toFixed(2) : "N/A"}
          </span>
          <span className="modal-category">
            {product.category || "Nekategorisano"}
          </span>
        </div>
        <p className="modal-id">ID: {product.id}</p>
      </div>
    </div>
  );
}

export default ProductDetailModal;
