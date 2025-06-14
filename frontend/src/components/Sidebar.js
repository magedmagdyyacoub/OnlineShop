import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

export default function Sidebar({
  showRoleManager,
  showCategoryManager,
  showBrandManager,
  showProductManager,
  showOrderManager, // new prop
}) {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <aside className="sidebar">
      {role === "superadmin" && (
        <>
          <button onClick={showRoleManager} className="role-btn">
            Manage Roles
          </button>
          <button onClick={showOrderManager} className="role-btn">
            Manage Orders
          </button>
        </>
      )}

      {role === "admin" && (
        <>
          <button onClick={showCategoryManager}>Manage Categories</button>
          <button onClick={showBrandManager}>Manage Brands</button>
          <button onClick={showProductManager}>Manage Products</button>
        </>
      )}
    </aside>
  );
}
