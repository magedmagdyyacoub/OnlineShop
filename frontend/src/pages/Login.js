import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ setAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      console.log("Login Response:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name || "Unknown");

      setAuth({ isAuthenticated: true, role: res.data.role });

      // ✅ Redirect based on role
      if (res.data.role === "Product Manager") {
        navigate("/product-manager");
      } else if (res.data.role === "admin") {
        navigate("/admin");

      } else if (res.data.role === "superadmin") {
        navigate("/admin");

      } else {
        navigate("/");
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || "Please try again."));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Login</button>
      <button type="button" onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}>
        Login with Google
      </button>
      <button type="button" onClick={() => window.location.href = "http://localhost:5000/api/auth/facebook"}>
        Login with Facebook
      </button>
      <p>
        Don't have an account?{" "}
        <a href="/register" style={{ color: "blue" }}>
          Register
        </a>
      </p>
    </form>
  );
}
