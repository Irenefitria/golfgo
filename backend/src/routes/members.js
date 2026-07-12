const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/members/lookup/:code
// Publik (tanpa auth) — dipakai saat booking untuk verifikasi ID member & preview nama.
// Hanya nama & tipe membership yang dikembalikan, tidak email/telepon.
router.get("/lookup/:code", async (req, res) => {
  try {
    const code = req.params.code.trim();
    if (!code) return res.status(400).json({ error: "ID Member wajib diisi" });

    const { rows } = await pool.query(
      `SELECT m.name, m.membership_id, mt.label AS membership_label
       FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_id
       WHERE upper(m.member_code) = upper($1) AND m.active = true`,
      [code]
    );
    if (!rows.length) return res.status(404).json({ error: "ID Member tidak ditemukan" });

    const m = rows[0];
    res.json({ name: m.name, membershipId: m.membership_id, membershipLabel: m.membership_label });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mencari member" });
  }
});

module.exports = router;
