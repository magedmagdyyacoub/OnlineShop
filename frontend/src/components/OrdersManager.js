import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get("/api/orders");
    setOrders(res.data);
  };

  const handleStatusChange = async (id, newStatus) => {
    await axios.put(`/api/orders/${id}`, { status: newStatus });
    fetchOrders(); // refresh data
  };

  return (
    <div className="orders-manager">
      <h2>Manage Orders</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.payment_method}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                {/* Optional manual save button
                <button onClick={() => handleStatusChange(order.id, order.status)}>
                  Save
                </button>
                */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
