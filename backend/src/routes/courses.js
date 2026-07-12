const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/courses  -> daftar semua course
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM courses";
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += " WHERE name ILIKE $1 OR location ILIKE $1";
    }
    query += " ORDER BY name";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar course" });
  }
});

// GET /api/courses/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Course tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil detail course" });
  }
});

// GET /api/courses/:id/slots?date=YYYY-MM-DD -> slot tersedia (exclude yang sudah full-booked)
router.get("/:id/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Parameter date wajib diisi" });

    const { rows: allSlots } = await pool.query(
      "SELECT time_slot FROM tee_slots WHERE course_id = $1 ORDER BY time_slot",
      [req.params.id]
    );

    const { rows: booked } = await pool.query(
      `SELECT time_slot FROM bookings
       WHERE course_id = $1 AND booking_date = $2 AND status IN ('pending','paid')`,
      [req.params.id, date]
    );
    const bookedSet = new Set(booked.map((b) => b.time_slot));

    const slots = allSlots.map((s) => ({
      time: s.time_slot,
      available: !bookedSet.has(s.time_slot),
    }));
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil slot" });
  }
});

module.exports = router;
