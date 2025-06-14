import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "cart", message: "Login first" }} replace />;
  }

  return children;
};

export default ProtectedRoute;
