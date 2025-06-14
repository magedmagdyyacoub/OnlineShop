import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaSearch } from "react-icons/fa";

import "../styles/Header.css";

const Header = ({ isAuthenticated, role, setAuth }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setAuth({ isAuthenticated: false, role: "" });
    navigate("/login");
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    // Simulated search suggestions (replace with actual API call)
    const allItems = ["Electronics", "Fashion", "Home & Kitchen", "Health", "Toys"];
    setSuggestions(
      allItems.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">OnlineShop</Link>

      {/* Search Bar */}
      <div className="search-container">
  <input
    type="text"
    placeholder="Search products, categories, brands..."
    value={searchTerm}
    onChange={handleSearchChange}
  />
  <button className="search-button" onClick={() => navigate(`/search?query=${encodeURIComponent(searchTerm)}`)}>
    <FaSearch />
  </button>
  {suggestions.length > 0 && (
    <ul className="autocomplete-list">
      {suggestions.map((suggestion, index) => (
        <li key={index} onClick={() => setSearchTerm(suggestion)}>
          {suggestion}
        </li>
      ))}
    </ul>
  )}
</div>


<div className="nav-links">
  {!isAuthenticated ? (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  ) : (
    <>
      {role === "customer" ? (
        <>
          <Link to="/">Home</Link>
          <Link to="/orders">My Orders</Link> {/* Added My Orders */}
        </>
      ) : role === "Product Manager" ? (
        <Link to="/product-manager">Product Manager Dashboard {name ? `(${name} - ${role})` : `(${role})`}</Link>
      ) : (
        <Link to="/admin">Admin Dashboard {name ? `(${name} - ${role})` : `(${role})`}</Link>
      )}

      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </>
  )}

  {/* Cart Icon */}
  <Link to="/cart" className="cart-icon">
    <FaShoppingCart />
  </Link>
</div>

    </nav>
  );
};

export default Header;
