const pool = require("../config/db");

// GET all categories
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// CREATE a new category
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

// UPDATE a category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
};

// DELETE a category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};
