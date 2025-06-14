import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ProductManagerDashboard from "./pages/ProductManagerDashboard";
import OrdersManager from "./components/OrdersManager";
import ProductDetails from "./pages/ProductDetails";
import MyOrders from "./pages/MyOrders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SearchResults from "./pages/SearchResults";
import OrderSuccess from "./pages/OrderSuccess";
import StripePaymentPage from "./pages/StripePaymentPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthSuccess from "./pages/OAuthSuccess";
import { useState } from "react";

function App() {
  const [auth, setAuth] = useState({ isAuthenticated: false, role: "" });

  return (
    <Router>
      <Header isAuthenticated={auth.isAuthenticated} role={auth.role} setAuth={setAuth} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/product-manager" element={<ProductManagerDashboard />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/oauth-success" element={<OAuthSuccess setAuth={setAuth} />} />
        <Route path="/orders" element={<MyOrders />} />
        {/* 🛡️ Protected Route for Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment/stripe" element={<StripePaymentPage />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
