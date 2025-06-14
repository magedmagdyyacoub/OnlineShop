const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const fs = require("fs");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads/brands/";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique);
  },
});
const upload = multer({ storage });

// Create brand
router.post("/", upload.single("image"), async (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file ? "/uploads/brands/" + req.file.filename : null;
  try {
    const result = await pool.query(
      "INSERT INTO brands (name, image_url) VALUES ($1, $2) RETURNING *",
      [name, imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all brands
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM brands ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update brand
router.put("/:id", upload.single("image"), async (req, res) => {
  const { name } = req.body;
  const imageUrl = req.file ? "/uploads/brands/" + req.file.filename : null;
  try {
    let result;
    if (imageUrl) {
      result = await pool.query(
        "UPDATE brands SET name = $1, image_url = $2 WHERE id = $3 RETURNING *",
        [name, imageUrl, req.params.id]
      );
    } else {
      result = await pool.query(
        "UPDATE brands SET name = $1 WHERE id = $2 RETURNING *",
        [name, req.params.id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete brand
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM brands WHERE id = $1", [req.params.id]);
    res.json({ message: "Brand deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
