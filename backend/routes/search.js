// routes/search.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/search?query=phone
router.get("/", async (req, res) => {
  const query = req.query.query;

  try {
    const likeQuery = `%${query.toLowerCase()}%`;

    const productResults = await pool.query(
      `SELECT id, name, description, price, 'product' AS type FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1`,
      [likeQuery]
    );

    const categoryResults = await pool.query(
      `SELECT id, name, NULL AS description, NULL AS price, 'category' AS type FROM categories WHERE LOWER(name) LIKE $1`,
      [likeQuery]
    );

    const brandResults = await pool.query(
      `SELECT id, name, NULL AS description, NULL AS price, 'brand' AS type FROM brands WHERE LOWER(name) LIKE $1`,
      [likeQuery]
    );

    const combinedResults = [
      ...productResults.rows,
      ...categoryResults.rows,
      ...brandResults.rows,
    ];

    res.json(combinedResults);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
