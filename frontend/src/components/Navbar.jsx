import { useAuth } from "../services/AuthContext.jsx";

// Navigation bar component for authenticated users.

function Navbar() {
  const { logout } = useAuth(); // Get logout function from AuthContext

  return (
    <nav className="navbar">
      {/* Application logo */}
      <img
        src="https://konovo.rs/wp-content/uploads/2023/03/konovo_logo_light.png"
        alt="Konovo Shop Logo"
        className="navbar-logo"
      />
      {/* Logout button */}
      <button onClick={logout} className="logout-button">
        Odjavi se
      </button>
    </nav>
  );
}

export default Navbar;
