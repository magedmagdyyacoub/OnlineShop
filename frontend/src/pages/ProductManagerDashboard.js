import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductManagerDashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, quantity } : product
      )
    );
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}/update-quantity`, { quantity });
      alert("Quantity updated successfully!");
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Product Manager Dashboard</h1>
      <p>Welcome, you can manage products here.</p>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product Name</th>
            <th className="border px-4 py-2">Current Quantity</th>
            <th className="border px-4 py-2">Update Quantity</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.quantity}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="border p-2 w-20"
                />
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => updateQuantity(product.id, product.quantity)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagerDashboard;
