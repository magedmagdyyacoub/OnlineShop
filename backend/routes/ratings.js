const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/auth"); // Ensure user is logged in

// ✅ POST: Submit a rating
router.post("/rate", authenticateToken, async (req, res) => {
  const { product_id, rating } = req.body;
  const user_id = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
  }

  try {
    await pool.query(
      `INSERT INTO ratings (user_id, product_id, rating) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET rating = EXCLUDED.rating`,
      [user_id, product_id, rating]
    );

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET: Fetch average rating for a product
router.get("/:product_id", async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT AVG(rating) AS avg_rating FROM ratings WHERE product_id = $1",
      [product_id]
    );

    res.json({ avg_rating: parseFloat(result.rows[0].avg_rating).toFixed(1) || "No Ratings" });
  } catch (err) {
    console.error("Error fetching rating:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
