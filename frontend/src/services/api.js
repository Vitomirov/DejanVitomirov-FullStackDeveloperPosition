// Base URL for our Python backend
const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Sends a login request to the backend.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} - A promise that resolves with the login data (including token) or rejects with an error.
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If response is not OK (e.g., 400, 401, 500), throw an error with the message from the backend
      throw new Error(data.error || "Login failed");
    }

    return data; // Contains { message: "Login successful!", token: "..." }
  } catch (error) {
    console.error("Login API error:", error);
    throw error; // Re-throw to be caught by the calling component
  }
};

/**
 * Fetches products from the backend.
 * @param {string} token - JWT token for authorization.
 * @param {string} [category] - Optional category to filter products.
 * @param {string} [search] - Optional search query for product name/description.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of products.
 */
export const fetchProducts = async (token, category = "", search = "") => {
  try {
    let url = new URL(`${API_BASE_URL}/products`);
    if (category) {
      url.searchParams.append("category", category);
    }
    if (search) {
      url.searchParams.append("search", search);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch products");
    }

    return data; // Array of processed product objects
  } catch (error) {
    console.error("Fetch products API error:", error);
    throw error;
  }
};

/**
 * Fetches a single product by ID from the backend.
 * @param {string} token - JWT token for authorization.
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<object>} - A promise that resolves with the single product object.
 */
export const fetchSingleProduct = async (token, productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch product details");
    }

    return data; // Single processed product object
  } catch (error) {
    console.error(`Fetch single product API error for ID ${productId}:`, error);
    throw error;
  }
};
