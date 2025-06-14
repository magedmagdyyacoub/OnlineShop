const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // adjust if your DB connection is in a different file

const commonPasswords = [
  "123456", "password", "123456789", "qwerty", "12345678", "111111", "123123",
  "abc123", "password1", "1234", "letmein", "monkey", "dragon"
];

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  if (commonPasswords.includes(password.toLowerCase())) {
    return res.status(400).json({ error: "Password is too common or weak." });
  }

  const complexityCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
  if (!complexityCheck.test(password)) {
    return res.status(400).json({ error: "Password must include uppercase, lowercase, number, and special character." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const roleName = role || 'customer';
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [roleName]);

    if (roleRes.rows.length === 0) {
      return res.status(400).json({ error: `Role '${roleName}' does not exist` });
    }

    const role_id = roleRes.rows[0].id;
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, role_id]
    );

    res.status(201).json({ message: 'User registered successfully', userId: newUser.rows[0].id, role: roleName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT users.id, users.name, users.password, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE email = $1
    `, [email]);

    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") return res.status(403).json({ message: "Only Super Admins can change roles" });

    const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [newRole]);
    if (roleRes.rows.length === 0) return res.status(400).json({ message: `Role '${newRole}' does not exist` });

    await pool.query("UPDATE users SET role_id = $1 WHERE id = $2", [roleRes.rows[0].id, userId]);

    res.json({ message: "User role updated successfully" });
  } catch (err) {
    console.error("Backend error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
