const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/menu -> menu dikelompokkan per kategori
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mc.name AS category, mi.id, mi.name, mi.price
       FROM menu_items mi
       JOIN menu_categories mc ON mc.id = mi.category_id
       WHERE mi.active = true
       ORDER BY mc.id, mi.name`
    );
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push({ id: row.id, name: row.name, price: Number(row.price) });
    }
    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil menu" });
  }
});

module.exports = router;
