const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// ✅ Fetch all users with role names
router.get("/", async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT users.id, users.name, users.email, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
    `);
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ✅ Fetch all roles for dropdown
router.get("/roles", async (req, res) => {
  try {
    const roles = await pool.query("SELECT name FROM roles");
    res.json(roles.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
