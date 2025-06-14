import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css"; // Assuming you have a CSS file for styling

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [passwordValid, setPasswordValid] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    setPasswordValid({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordValid).every(Boolean)) {
      alert("Password must include uppercase, lowercase, number, and special character.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Registration failed: " + errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => {
          setForm({ ...form, password: e.target.value });
          validatePassword(e.target.value);
        }}
      />
      <div className="password-validation">
        <p className={passwordValid.uppercase ? "valid" : "invalid"}>✔ Uppercase Letter</p>
        <p className={passwordValid.lowercase ? "valid" : "invalid"}>✔ Lowercase Letter</p>
        <p className={passwordValid.number ? "valid" : "invalid"}>✔ Number</p>
        <p className={passwordValid.specialChar ? "valid" : "invalid"}>✔ Special Character</p>
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
