import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const [newBrand, setNewBrand] = useState("");
  const [newBrandImage, setNewBrandImage] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);

  const [products, setProducts] = useState([]);
const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", category_id: "", brand_id: "", image: null });
const [editingProduct, setEditingProduct] = useState(null);
const [productPage, setProductPage] = useState(1);


  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showBrandManager, setShowBrandManager] = useState(false);

  const [userPage, setUserPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const itemsPerPage = 3;

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then(res => setUsers(res.data.map(user => ({ ...user, newRole: user.role }))))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/users/roles")
      .then(res => setRoles(res.data.map(r => r.name)))
      .catch(err => console.error(err));

    if (role === "admin" || role === "superadmin") {
      fetchCategories();
      fetchBrands();
      fetchProducts();
    }
  }, [role]);


  const fetchProducts = () => {
  axios.get("http://localhost:5000/api/products")
    .then(res => setProducts(res.data))
    .catch(() => alert("Failed to fetch products"));
};

  const fetchCategories = () => {
    axios.get("http://localhost:5000/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  };

  const fetchBrands = () => {
    axios.get("http://localhost:5000/api/brands")
      .then(res => setBrands(res.data))
      .catch(err => console.error(err));
  };

  const handleRoleChange = (userId, newRole) => {
    axios.put("http://localhost:5000/api/auth/update-role",
      { userId, newRole },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        alert("Role updated successfully");
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      })
      .catch(err => {
        alert("Error: " + (err.response?.data?.message || "Failed to update role"));
      });
  };

  const handleAddCategory = () => {
    if (!newCategory) return alert("Category name is required");
    axios.post("http://localhost:5000/api/categories", { name: newCategory })
      .then(() => {
        fetchCategories();
        setNewCategory("");
      })
      .catch(() => alert("Failed to add category"));
  };

  const handleDeleteCategory = (id) => {
    axios.delete(`http://localhost:5000/api/categories/${id}`)
      .then(() => fetchCategories())
      .catch(() => alert("Failed to delete category"));
  };

  const handleUpdateCategory = () => {
    axios.put(`http://localhost:5000/api/categories/${editingCategory.id}`, {
      name: editingCategory.name,
    })
      .then(() => {
        fetchCategories();
        setEditingCategory(null);
      })
      .catch(() => alert("Failed to update category"));
  };

  const handleAddProduct = () => {
  const formData = new FormData();
  Object.entries(newProduct).forEach(([key, value]) => {
    formData.append(key, value);
  });

  axios.post("http://localhost:5000/api/products", formData)
    .then(() => {
      fetchProducts();
      setNewProduct({ name: "", description: "", price: "", category_id: "", brand_id: "", image: null });
    })
    .catch(() => alert("Failed to add product"));
};

const handleDeleteProduct = (id) => {
  axios.delete(`http://localhost:5000/api/products/${id}`)
    .then(() => fetchProducts())
    .catch(() => alert("Failed to delete product"));
};

const handleUpdateProduct = () => {
  const formData = new FormData();
  Object.entries(editingProduct).forEach(([key, value]) => {
    if (key === "image" && !value) return;
    formData.append(key, value);
  });

  axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formData)
    .then(() => {
      fetchProducts();
      setEditingProduct(null);
    })
    .catch(() => alert("Failed to update product"));
};


  const handleAddBrand = () => {
    if (!newBrand || !newBrandImage) return alert("Brand name and image are required");

    const formData = new FormData();
    formData.append("name", newBrand);
    formData.append("image", newBrandImage);

    axios.post("http://localhost:5000/api/brands", formData)
      .then(() => {
        fetchBrands();
        setNewBrand("");
        setNewBrandImage(null);
      })
      .catch(() => alert("Failed to add brand"));
  };

  const handleDeleteBrand = (id) => {
    axios.delete(`http://localhost:5000/api/brands/${id}`)
      .then(() => fetchBrands())
      .catch(() => alert("Failed to delete brand"));
  };

  const handleUpdateBrand = () => {
    const formData = new FormData();
    formData.append("name", editingBrand.name);
    if (editingBrand.image) formData.append("image", editingBrand.image);

    axios.put(`http://localhost:5000/api/brands/${editingBrand.id}`, formData)
      .then(() => {
        fetchBrands();
        setEditingBrand(null);
      })
      .catch(() => alert("Failed to update brand"));
  };
const [showProductManager, setShowProductManager] = useState(false);
const [orders, setOrders] = useState([]);
const [showOrderManager, setShowOrderManager] = useState(false);

const fetchOrders = () => {
  axios.get("http://localhost:5000/api/orders")
    .then(res => setOrders(res.data))
    .catch(() => alert("Failed to fetch orders"));
};

const handleOrderStatusUpdate = (id, status) => {
  axios.put(`http://localhost:5000/api/orders/${id}`, { status })
    .then(() => fetchOrders())
    .catch(() => alert("Failed to update order status"));
};

useEffect(() => {
  if (role === "admin" || role === "superadmin") {
    fetchOrders();
  }
}, [role]);

  // Pagination utilities
  const paginate = (items, page) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  return (
    <div className="admin-dashboard">
      <Sidebar
        showRoleManager={() => setShowRoleManager(!showRoleManager)}
        showCategoryManager={() => setShowCategoryManager(!showCategoryManager)}
        showBrandManager={() => setShowBrandManager(!showBrandManager)}
        showProductManager={() => setShowProductManager(!showProductManager)}
        showOrderManager={() => setShowOrderManager(!showOrderManager)} 
      />

      {/* SUPERADMIN - Role Management */}
      {showRoleManager && role === "superadmin" && (
        <div className="role-manager">
          <h2>Manage User Roles</h2>
          <table className="user-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>New Role</th><th>Action</th></tr>
            </thead>
            <tbody>
              {paginate(users, userPage).map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <select
                      value={user.newRole}
                      onChange={(e) =>
                        setUsers(users.map(u =>
                          u.id === user.id ? { ...u, newRole: e.target.value } : u
                        ))
                      }
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleRoleChange(user.id, user.newRole)}>
                      Update Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button disabled={userPage === 1} onClick={() => setUserPage(userPage - 1)}>Previous</button>
            <button disabled={userPage * itemsPerPage >= users.length} onClick={() => setUserPage(userPage + 1)}>Next</button>
          </div>
        </div>
      )}
      {/* ADMIN - Order Management */}
      {role === "superadmin" && showOrderManager && (
        <div className="order-manager">
    <h2>Manage Orders</h2>
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th>Update Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.payment_method}</td>
            <td>{order.status}</td>
            <td>
              <select
                value={order.status}
                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      {/* ADMIN - Category Management */}
      {role === "admin" && showCategoryManager && (
        <div className="category-manager">
          <h2>Manage Categories</h2>
          <div className="category-form">
            {editingCategory ? (
              <>
                <input
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  placeholder="Edit Category Name"
                />
                <button onClick={handleUpdateCategory}>Update</button>
                <button onClick={() => setEditingCategory(null)}>Cancel</button>
              </>
            ) : (
              <>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category Name"
                />
                <button onClick={handleAddCategory}>Add Category</button>
              </>
            )}
          </div>
          <ul className="category-list">
            {paginate(categories, categoryPage).map(cat => (
              <li key={cat.id}>
                {cat.name}
                <button onClick={() => setEditingCategory(cat)}>Edit</button>
                <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button disabled={categoryPage === 1} onClick={() => setCategoryPage(categoryPage - 1)}>Previous</button>
            <button disabled={categoryPage * itemsPerPage >= categories.length} onClick={() => setCategoryPage(categoryPage + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* ADMIN - Brand Management */}
      {role === "admin" && showBrandManager && (
        <div className="brand-manager">
          <h2>Manage Brands</h2>
          <div className="brand-form">
            {editingBrand ? (
              <>
                <input
                  value={editingBrand.name}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, name: e.target.value })
                  }
                  placeholder="Edit Brand Name"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, image: e.target.files[0] })
                  }
                />
                <button onClick={handleUpdateBrand}>Update</button>
                <button onClick={() => setEditingBrand(null)}>Cancel</button>
              </>
            ) : (
              <>
                <input
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="New Brand Name"
                />
                <input
                  type="file"
                  onChange={(e) => setNewBrandImage(e.target.files[0])}
                />
                <button onClick={handleAddBrand}>Add Brand</button>
              </>
            )}
          </div>
        <ul className="brand-list">
  {paginate(brands, brandPage).map(brand => (
    <li key={brand.id}>
      {brand.name}
      {brand.image_url && (
        <img
          src={`http://localhost:5000/${brand.image_url}`}
          alt={brand.name}
          width="50"
        />
      )}
      <button onClick={() => setEditingBrand(brand)}>Edit</button>
      <button onClick={() => handleDeleteBrand(brand.id)}>Delete</button>
    </li>
  ))}
</ul>

          <div className="pagination">
            <button disabled={brandPage === 1} onClick={() => setBrandPage(brandPage - 1)}>Previous</button>
            <button disabled={brandPage * itemsPerPage >= brands.length} onClick={() => setBrandPage(brandPage + 1)}>Next</button>
          </div>
        </div>
      )}
      {/* ADMIN - Product Management */}
      {role === "admin" && showProductManager && (
  <div className="product-manager">
    <h2>Manage Products</h2>
    <div className="product-form">
      {editingProduct ? (
        <>
          <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Name" />
          <input value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Description" />
          <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} placeholder="Price" />
          <select value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={editingProduct.brand_id} onChange={(e) => setEditingProduct({ ...editingProduct, brand_id: e.target.value })}>
            <option value="">Select Brand</option>
            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <input type="file" onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.files[0] })} />
          <button onClick={handleUpdateProduct}>Update</button>
          <button onClick={() => setEditingProduct(null)}>Cancel</button>
        </>
      ) : (
        <>
          <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Name" />
          <input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" />
          <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" />
          <select value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={newProduct.brand_id} onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })}>
            <option value="">Select Brand</option>
            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <input type="file" onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })} />
          <button onClick={handleAddProduct}>Add Product</button>
        </>
      )}
    </div>

    <ul className="product-list">
      {paginate(products, productPage).map(product => (
        <li key={product.id}>
          <strong>{product.name}</strong> - ${product.price}
          <br />
          <small>{product.description}</small>
          <br />
          {product.image_url && (
            <img
              src={`http://localhost:5000/${product.image_url}`}
              alt={product.name}
              width="50"
            />
          )}
          <button onClick={() => setEditingProduct(product)}>Edit</button>
          <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
        </li>
      ))}
    </ul>

    <div className="pagination">
      <button disabled={productPage === 1} onClick={() => setProductPage(productPage - 1)}>Previous</button>
      <button disabled={productPage * itemsPerPage >= products.length} onClick={() => setProductPage(productPage + 1)}>Next</button>
    </div>
  </div>
)}

    </div>
  );
}
