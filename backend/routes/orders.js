const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Adjust path if needed

// GET all orders
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, payment_method, status FROM orders");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// PUT update order status
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders for a specific user
router.get("/customer/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, name, address, email, phone, total_price, payment_method, status FROM orders WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

