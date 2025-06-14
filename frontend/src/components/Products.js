import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "../styles/products.css";

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [shuffledProducts, setShuffledProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch products with ratings
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const shuffled = res.data.sort(() => 0.5 - Math.random());
      setAllProducts(shuffled);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setShuffledProducts(allProducts.slice(0, visibleCount));
  }, [allProducts, visibleCount]);

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  const handleViewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { state: { message: "Login first to add items to the cart.", from: `/product/${product.id}` } });
      return;
    }

    setAddingToCart(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/add",
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${product.name} added to cart! Remaining stock: ${res.data.remainingStock}`);

      setAllProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === product.id ? { ...p, quantity: res.data.remainingStock } : p))
      );
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // ✅ Handle product rating
  const handleRate = async (productId, rating) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login to rate products.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/ratings/rate",
        { product_id: productId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`You rated this ${rating} stars!`);
      fetchProducts(); // Refresh ratings after submission
    } catch (err) {
      console.error("Error rating product:", err);
      alert("Failed to rate product.");
    }
  };

  const renderStars = (productId, avgRating) => (
    [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        onClick={() => handleRate(productId, index + 1)}
        className="star"
        style={{ color: index < avgRating ? "gold" : "gray", cursor: "pointer" }}
      />
    ))
  );

  return (
    <div className="products-container">
      <div className="row">
        {shuffledProducts.map((product, index) => (
          <motion.div
            className="col"
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <motion.div
              className="card"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src={product.image_url} alt={product.name} className="card-img-top" />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description?.substring(0, 100)}...</p>
                <p className="text-primary">${product.price}</p>
                <p className="text-warning">Quantity Available: {product.quantity}</p>
                <p className="text-secondary">
                  Managed by: {product.product_manager_name || "Not Assigned"}
                </p>
                <p className="text-primary">Average Rating: {product.avg_rating || "No Ratings"}</p>
                <div className="stars">{renderStars(product.id, product.avg_rating)}</div>
                <div className="button-group">
                  <button className="btn-primary" onClick={() => handleViewDetails(product.id)}>
                    View Details
                  </button>
                  <button className="btn-secondary" onClick={() => handleAddToCart(product)} disabled={addingToCart}>
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      {visibleCount < allProducts.length && (
        <button className="load-more-btn" onClick={loadMore}>
          Load More
        </button>
      )}
      {loading && <p>Loading products...</p>}
    </div>
  );
}
