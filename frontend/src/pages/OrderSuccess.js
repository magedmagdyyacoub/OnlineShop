// src/pages/OrderSuccess.js (React component)
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function OrderSuccess() {
  const [message, setMessage] = useState("Processing order...");
  const navigate = useNavigate();
  const location = useLocation();
  const userToken = localStorage.getItem("token");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");

    if (!sessionId) {
      setMessage("No payment session ID found.");
      return;
    }

    const confirmOrder = async () => {
      try {
        // You need to get cartItems and customer data from somewhere,
        // e.g., saved in localStorage or passed via state during checkout

        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const customer = JSON.parse(localStorage.getItem("customer")) || {};

        const response = await axios.post(
          "http://localhost:5000/api/checkout/confirm",
          {
            paymentMethod: "stripe",
            paymentId: sessionId,
            items: cartItems,
            customer,
          },
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );

        setMessage("Order completed successfully!");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("customer");

        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        console.error("Failed to confirm order", error);
        setMessage("Failed to complete your order. Please contact support.");
      }
    };

    confirmOrder();
  }, [location.search, navigate, userToken]);

  return <div>{message}</div>;
}
