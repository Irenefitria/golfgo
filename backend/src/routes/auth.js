const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

// hash palsu dipakai saat username tidak ditemukan, supaya waktu respons konsisten
// dan tidak membocorkan username mana yang valid (timing attack).
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8O5g6Q6b0z1u9Z9Q6Q6b0z1u9Z9Q6Q";

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi" });
    }

    const { rows } = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);
    if (!admin || !valid) return res.status(401).json({ error: "Username atau password salah" });

    const token = jwt.sign({ sub: admin.id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal login" });
  }
});

module.exports = router;
