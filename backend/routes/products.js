const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/products/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// GET all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT products.id, products.name, products.description, products.image_url, products.price, products.quantity, 
             users.name AS product_manager_name
      FROM products
      LEFT JOIN users ON products.user_id = users.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});


// POST a new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category_id, brand_id } = req.body;
    const image_url = req.file ? "uploads/products/" + req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO products (name, price, description, image_url, category_id, brand_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, price, description, image_url, category_id || null, brand_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// PUT update a product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category_id, brand_id } = req.body;
    const image_url = req.file ? "uploads/products/" + req.file.filename : null;

    const oldProduct = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (!oldProduct.rows.length) return res.status(404).json({ error: "Product not found" });

    const updatedProduct = await pool.query(
      `UPDATE products SET 
        name = $1,
        price = $2,
        description = $3,
        image_url = COALESCE($4, image_url),
        category_id = $5,
        brand_id = $6
       WHERE id = $7 RETURNING *`,
      [name, price, description, image_url, category_id || null, brand_id || null, id]
    );

    res.json(updatedProduct.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]); // Send product data
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.put("/:productId/update-quantity", async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    await pool.query("UPDATE products SET quantity = $1 WHERE id = $2", [quantity, productId]);

    res.json({ message: "Quantity updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

module.exports = router;
