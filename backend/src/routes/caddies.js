const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/caddies -> semua caddy aktif
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM caddies WHERE active = true ORDER BY rating DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar caddy" });
  }
});

// GET /api/caddies/availability?date=&slot= -> caddy yang sudah terpakai di jadwal itu
router.get("/availability", async (req, res) => {
  try {
    const { date, slot } = req.query;
    if (!date || !slot) return res.status(400).json({ error: "Parameter date & slot wajib diisi" });

    const { rows } = await pool.query(
      `SELECT DISTINCT bp.caddy_id
       FROM booking_players bp
       JOIN bookings b ON b.id = bp.booking_id
       WHERE b.booking_date = $1 AND b.time_slot = $2
         AND b.status IN ('pending','paid')
         AND bp.caddy_id IS NOT NULL`,
      [date, slot]
    );
    res.json({ takenCaddyIds: rows.map((r) => r.caddy_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengecek ketersediaan caddy" });
  }
});

module.exports = router;
