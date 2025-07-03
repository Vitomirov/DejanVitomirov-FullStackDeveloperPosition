# Import necessary libraries
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import re
from bs4 import BeautifulSoup # Import BeautifulSoup
import traceback # Import traceback module
import json # Import json module

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

# --- Define known categories for "Ostalo" filtering ---
# This list MUST match the values in your frontend dropdown, excluding "Svi proizvodi" and "Ostalo"
KNOWN_CATEGORIES = [
    "Monitori",
    "Toneri i potrošni materijal",
    "Mobilni/Fiksni telefoni i tableti",
    "Slušalice",
    "Torbe i rančevi",
    "Štampači",
    "Električni trotineti"
]

# --- Helper function for product processing ---
def process_product_data(product):
    """
    Processes a single product:
    - Maps external API keys to frontend-friendly keys.
    - Increases price by 10% for 'Monitori' category.
    - Replaces 'brzina' with 'performanse' (case-insensitive) in description.
    - Cleans up description by removing HTML tags and newline characters.
    """
    processed_product = {}

    # Map keys from external API to expected frontend keys
    processed_product['id'] = product.get('sif_product') # Map 'sif_product' to 'id'
    processed_product['name'] = product.get('naziv')     # Map 'naziv' to 'name'

    # Handle category name: attempt to decode literal Unicode escape sequences
    category_name = product.get('categoryName', '')
    if category_name:
        try:
            # Wrap the string in quotes to make it a valid JSON string, then load it
            # This will correctly interpret literal \uXXXX sequences
            processed_product['category'] = json.loads(f'"{category_name}"')
        except json.JSONDecodeError:
            # If it's not a valid JSON string (e.g., no literal \uXXXX), keep original
            processed_product['category'] = category_name
    else:
        processed_product['category'] = ''

    processed_product['image'] = product.get('imgsrc')   # Map 'imgsrc' to 'image'

    # Handle price
    current_price = product.get('price', 0)
    try:
        current_price = float(current_price)
    except (ValueError, TypeError):
        current_price = 0 # Default to 0 if price is not a valid number

    # --- KLJUČNA PROMENA: Čuvamo originalnu cenu pre obrade ---
    processed_product['original_price'] = round(current_price, 2)

    # Increase price for 'Monitori' category
    if processed_product.get('category') == 'Monitori':
        processed_product['price'] = round(current_price * 1.10, 2)
    else:
        processed_product['price'] = round(current_price, 2) # Ensure it's rounded even if not monitor

    # Clean up and replace "brzina" in description
    description = product.get('description', '')
    if description:
        # Use BeautifulSoup to remove all HTML tags
        soup = BeautifulSoup(description, 'html.parser')
        clean_description = soup.get_text(separator=' ') # Get text content, replacing tags with a space
        
        # Remove extra whitespace and newline characters
        clean_description = re.sub(r'\s+', ' ', clean_description).strip()
        clean_description = clean_description.replace('\r', '').replace('\n', '')
        
        # Replace "brzina" with "performanse" (case-insensitive)
        processed_product['description'] = re.sub(r'brzina', 'performanse', clean_description, flags=re.IGNORECASE).strip()
    else:
        processed_product['description'] = ''

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
        # Log the full traceback for unexpected errors
        traceback.print_exc()
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
        if category_filter.lower() == 'ostalo':
            # Filter for categories NOT in the KNOWN_CATEGORIES list
            processed_products = [
                p for p in processed_products
                if p.get('category') and p['category'] not in KNOWN_CATEGORIES
            ]
        else:
            # Normal category filtering
            processed_products = [
                p for p in processed_products
                if p.get('category') and p['category'].lower() == category_filter.lower()
            ]


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
        # ### AŽURIRANE LINIJE ZA POJEDINAČNI PROIZVOD ###
        if found_product.get('category') == 'Monitori':
            print(f"\n--- Detalji izabranog monitora: {found_product.get('name')} ---")
            print(f"  Originalna cena: {found_product.get('original_price')}")
            print(f"  Cena (uvećana za 10%): {found_product.get('price')}")
            print(f"  Kategorija: {found_product.get('category')}")
            print("--------------------------------------------------\n")
        # ### KRAJ AŽURIRANIH LINIJA ###
        return jsonify(found_product), 200
    else:
        return jsonify({"error": "Product not found."}), 404


# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, port=5000)
