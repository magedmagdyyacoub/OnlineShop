import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cart.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const userToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userToken) {
        setIsLoggedIn(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      setIsLoggedIn(true);

      try {
        const response = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error("Error loading cart items:", error);
        setCartItems([]);
      }
    };

    fetchCartItems();

    const handleStorageChange = () => {
      fetchCartItems();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, userToken]);

  const increaseQuantity = async (itemId, currentQuantity) => {
    try {
      const newQuantity = currentQuantity + 1;
      await axios.put(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to increase quantity", error);
    }
  };

  const decreaseQuantity = async (itemId, currentQuantity) => {
    if (currentQuantity <= 1) return;

    try {
      const newQuantity = currentQuantity - 1;
      await axios.put(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to decrease quantity", error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      setCartItems((prevItems) => prevItems.filter((item) => item.cart_item_id !== itemId));
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  // Calculate total cart price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (!isLoggedIn) {
    return <p className="login-warning">Log in first to access your cart.</p>;
  }

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.cart_item_id} className="cart-item">
                <img
                  src={`http://localhost:5000/${item.image_url}`}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/default-product.png";
                  }}
                />
                <div>
                  <h3>{item.name}</h3>
                  <p>Price: ${Number(item.price).toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item.cart_item_id, item.quantity)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.cart_item_id, item.quantity)}>+</button>
                  </div>
                <p>
  <strong>Total: ${(Number(item.price) * item.quantity).toFixed(2)}</strong>
</p>
                  <button onClick={() => removeItem(item.cart_item_id)} className="remove-btn">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h3 className="cart-total">Cart Total: ${totalPrice.toFixed(2)}</h3>

          <button className="checkout-btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
