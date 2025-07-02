# Import necessary libraries
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import re

# Load environment variables
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Configure CORS
from flask_cors import CORS
CORS(app)

# --- External API Configuration ---
EXTERNAL_API_BASE_URL = os.getenv("EXTERNAL_API_BASE_URL", "https://zadatak.konovo.rs")
EXTERNAL_LOGIN_URL = f"{EXTERNAL_API_BASE_URL}/login"
EXTERNAL_PRODUCTS_URL = f"{EXTERNAL_API_BASE_URL}/products"

# Test credentials
TEST_USERNAME = os.getenv("TEST_USERNAME", "zadatak")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "zadatak")

# --- Global variable for JWT token ---
jwt_token = None

# --- Helper function for product processing ---
def process_product_data(product):
    """
    Processes a single product:
    - Increases price by 10% for 'Monitori' category.
    - Replaces 'brzina' with 'performanse' (case-insensitive) in description.
    """
    processed_product = product.copy()

    # Increase price for 'Monitori'
    if processed_product.get('category') == 'Monitori':
        try:
            current_price = float(processed_product.get('price', 0))
            processed_product['price'] = round(current_price * 1.10, 2)
        except ValueError:
            pass

    # Replace 'brzina' with 'performanse' in description
    description = processed_product.get('description', '')
    if description:
        processed_product['description'] = re.sub(r'brzina', 'performanse', description, flags=re.IGNORECASE)

    return processed_product

# --- Common function to fetch and process all products ---
def _fetch_and_process_all_products():
    """
    Helper function to fetch all products from the external API
    and apply the processing logic. Handles token check and common errors.
    Returns (processed_products, status_code, error_message)
    """
    global jwt_token

    if not jwt_token:
        return None, 401, "Authorization token is missing. Please log in."

    headers = {
        "Authorization": f"Bearer {jwt_token}"
    }
    try:
        response = requests.get(EXTERNAL_PRODUCTS_URL, headers=headers)
        response.raise_for_status()

        products_data = response.json()
        processed_products = [process_product_data(p) for p in products_data]
        return processed_products, 200, None

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with external products API: {e}")
        return None, 500, f"Error fetching products: {e}"
    except Exception as e:
        print(f"Unexpected error fetching products: {e}")
        return None, 500, "An unexpected error occurred while fetching products."

# --- Backend API Routes ---

@app.route('/')
def home():
    return jsonify({"message": "Backend is running!"})

@app.route('/login', methods=['POST'])
def login():
    """
    Handles user login, forwards credentials to external API, returns JWT token.
    """
    global jwt_token

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    try:
        response = requests.post(EXTERNAL_LOGIN_URL, json={
            "username": username,
            "password": password
        })
        response.raise_for_status()

        login_data = response.json()
        token = login_data.get('token')

        if token:
            jwt_token = token
            return jsonify({"message": "Login successful!", "token": token}), 200
        else:
            return jsonify({"error": "Login failed: Token not received."}), 401

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with external login API: {e}")
        return jsonify({"error": f"Login error: {e}"}), 500
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        return jsonify({"error": "An unexpected error occurred during login."}), 500

@app.route('/products', methods=['GET'])
def get_products():
    """
    Fetches and processes products, requires JWT token, supports filtering and search.
    """
    processed_products, status_code, error_message = _fetch_and_process_all_products()

    if error_message:
        return jsonify({"error": error_message}), status_code

    # Apply filtering and search
    category_filter = request.args.get('category')
    search_query = request.args.get('search')

    if category_filter:
        processed_products = [p for p in processed_products if p.get('category') and p['category'].lower() == category_filter.lower()]

    if search_query:
        processed_products = [p for p in processed_products if
                              (p.get('name') and search_query.lower() in p['name'].lower()) or
                              (p.get('description') and search_query.lower() in p['description'].lower())]

    return jsonify(processed_products), 200

@app.route('/products/<string:product_id>', methods=['GET'])
def get_single_product(product_id):
    """
    Fetches details of a specific product by ID, applies processing logic.
    """
    processed_products, status_code, error_message = _fetch_and_process_all_products()

    if error_message:
        return jsonify({"error": error_message}), status_code

    found_product = next((p for p in processed_products if str(p.get('id')) == product_id), None)

    if found_product:
        return jsonify(found_product), 200
    else:
        return jsonify({"error": "Product not found."}), 404


# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, port=5000)
