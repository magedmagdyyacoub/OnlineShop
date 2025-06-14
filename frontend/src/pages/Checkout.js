import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/checkout.css";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    stripeCardNumber: "",
    stripeExpiry: "",
    stripeCVC: "",
    paypalEmail: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");

  // Load saved cart and customer from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) setCartItems(JSON.parse(savedCart));

    const savedCustomer = localStorage.getItem("customer");
    if (savedCustomer) setCustomer(JSON.parse(savedCustomer));
  }, []);

  // Save cartItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save customer info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("customer", JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userToken) {
        setIsLoggedIn(false);
        setOrderStatus("Please log in to proceed to checkout.");
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
  }, [navigate, userToken]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setOrderStatus("Your cart is empty. Add items before placing an order.");
      return;
    }

    if (!customer.name || !customer.address || !customer.email || !customer.phone) {
      setOrderStatus("Please fill in all customer details.");
      return;
    }

    if (paymentMethod === "stripe") {
      if (!customer.stripeCardNumber || !customer.stripeExpiry || !customer.stripeCVC) {
        setOrderStatus("Please fill in all Stripe card details.");
        return;
      }
    }

    if (paymentMethod === "paypal") {
      if (!customer.paypalEmail) {
        setOrderStatus("Please enter your PayPal email.");
        return;
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/checkout",
        {
          items: cartItems,
          customer,
          paymentMethod,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (paymentMethod === "stripe") {
        window.location.href = response.data.sessionUrl;
      } else if (paymentMethod === "paypal") {
        window.location.href = response.data.approvalUrl;
      } else {
        // Cash payment: clear cart and redirect
        setCartItems([]); // clear local cart display
        setOrderStatus(null); // clear any messages
        // Also clear localStorage cartItems since order is placed
        localStorage.removeItem("cartItems");
        localStorage.removeItem("customer");
        setTimeout(() => {
          navigate("/order-success");
        }, 100);
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      setOrderStatus("Failed to place order. Please try again.");
    }
  };

  if (!isLoggedIn) {
    return (
      <p className="login-warning">
        {orderStatus || "Log in first to checkout."}
      </p>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="checkout-list">
            {cartItems.map((item) => (
              <li key={item.cart_item_id} className="checkout-item">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <h3 className="checkout-total">Total: ${totalPrice.toFixed(2)}</h3>

          <h3>Customer Details</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePlaceOrder();
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={customer.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={customer.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={customer.phone}
              onChange={handleInputChange}
              required
            />

            <h3>Payment Method</h3>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash on Delivery</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>

            {paymentMethod === "stripe" && (
              <div className="payment-section">
                <h4>Stripe Payment Info</h4>
                <input
                  type="text"
                  name="stripeCardNumber"
                  placeholder="Card Number"
                  onChange={handleInputChange}
                  required
                  value={customer.stripeCardNumber}
                />
                <input
                  type="text"
                  name="stripeExpiry"
                  placeholder="Expiry Date (MM/YY)"
                  onChange={handleInputChange}
                  required
                  value={customer.stripeExpiry}
                />
                <input
                  type="text"
                  name="stripeCVC"
                  placeholder="CVC"
                  onChange={handleInputChange}
                  required
                  value={customer.stripeCVC}
                />
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="payment-section">
                <h4>PayPal Account Info</h4>
                <input
                  type="email"
                  name="paypalEmail"
                  placeholder="PayPal Email"
                  onChange={handleInputChange}
                  required
                  value={customer.paypalEmail}
                />
              </div>
            )}

            <button type="submit" className="place-order-btn">
              Place Order
            </button>
          </form>

          {orderStatus && <p className="order-status">{orderStatus}</p>}
        </>
      )}
    </div>
  );
}
