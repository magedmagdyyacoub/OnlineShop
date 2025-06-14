const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/auth"); // JWT middleware

// POST: Add item to cart (if item exists, increase quantity)
router.post("/add", authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.user.id;

  try {
    // ✅ Check available product quantity
    const productRes = await pool.query("SELECT quantity FROM products WHERE id = $1", [product_id]);
    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const availableQuantity = productRes.rows[0].quantity;
    if (availableQuantity < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // ✅ Deduct quantity from the products table
    await pool.query("UPDATE products SET quantity = quantity - $1 WHERE id = $2", [quantity, product_id]);

    // ✅ Check if product already in cart
    const existingCartItem = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (existingCartItem.rows.length > 0) {
      // Update quantity in cart
      const newQuantity = existingCartItem.rows[0].quantity + quantity;
      await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3",
        [newQuantity, user_id, product_id]
      );
    } else {
      // Add new cart item
      await pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [user_id, product_id, quantity]
      );
    }

    res.json({ message: "Item added to cart", remainingStock: availableQuantity - quantity });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Fetch user cart items with product details
router.get("/", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Update quantity of cart item
router.put("/:id", authenticateToken, async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    const result = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [quantity, itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ message: "Quantity updated", cartItem: result.rows[0] });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove item from cart
router.delete("/:id", authenticateToken, async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clear", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
