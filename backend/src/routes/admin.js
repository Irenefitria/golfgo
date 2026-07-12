const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { generateMemberCode } = require("../utils/pricing");

const router = express.Router();
router.use(requireAdmin);

const BOOKING_STATUSES = ["pending", "paid", "cancelled", "rescheduled", "completed"];
const BOOKING_EDITABLE_FIELDS = ["status", "booking_date", "time_slot", "contact_name", "contact_phone"];

// ---------- Bookings ----------

// GET /api/admin/bookings?status=&search=
router.get("/bookings", async (req, res) => {
  try {
    const { status, search } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`b.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(b.booking_code ILIKE $${params.length} OR b.contact_name ILIKE $${params.length} OR b.contact_phone ILIKE $${params.length})`
      );
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT b.*, c.name AS course_name FROM bookings b
       JOIN courses c ON c.id = b.course_id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT 300`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar booking" });
  }
});

// PATCH /api/admin/bookings/:code
router.patch("/bookings/:code", async (req, res) => {
  const fields = Object.keys(req.body).filter((k) => BOOKING_EDITABLE_FIELDS.includes(k));
  if (!fields.length) return res.status(400).json({ error: "Tidak ada field valid untuk diupdate" });
  if (fields.includes("status") && !BOOKING_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: "Status tidak valid" });
  }

  const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
  const values = fields.map((f) => req.body[f]);
  values.push(req.params.code);

  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET ${setClauses.join(", ")}, updated_at = now()
       WHERE booking_code = $${values.length} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: "Booking tidak ditemukan" });

    await pool.query("INSERT INTO booking_events (booking_id, event_type, meta) VALUES ($1,'admin_updated',$2)", [
      rows[0].id,
      JSON.stringify({ fields, admin: req.admin.username }),
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update booking" });
  }
});

// DELETE /api/admin/bookings/:code
router.delete("/bookings/:code", async (req, res) => {
  try {
    const { rows } = await pool.query("DELETE FROM bookings WHERE booking_code = $1 RETURNING id", [req.params.code]);
    if (!rows.length) return res.status(404).json({ error: "Booking tidak ditemukan" });
    res.json({ status: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus booking" });
  }
});

// ---------- Members ----------

// GET /api/admin/members
router.get("/members", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*, mt.label AS membership_label FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar member" });
  }
});

// POST /api/admin/members  body: { name, email, phone, membershipId }
router.post("/members", async (req, res) => {
  try {
    const { name, email, phone, membershipId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Nama wajib diisi" });

    let inserted;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { rows } = await pool.query(
          `INSERT INTO members (name, email, phone, membership_id, member_code) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [name.trim(), email || null, phone || null, membershipId || null, generateMemberCode()]
        );
        inserted = rows[0];
        break;
      } catch (err) {
        if (err.code === "23505" && attempt < 4) continue; // member_code bentrok, coba lagi
        throw err;
      }
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambahkan member" });
  }
});

// DELETE /api/admin/members/:id
router.delete("/members/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("DELETE FROM members WHERE id = $1 RETURNING id", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Member tidak ditemukan" });
    res.json({ status: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus member" });
  }
});

module.exports = router;
