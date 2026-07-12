const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM player_categories ORDER BY multiplier DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil kategori pemain" });
  }
});

router.get("/memberships", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM membership_types ORDER BY discount DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil tipe membership" });
  }
});

module.exports = router;
