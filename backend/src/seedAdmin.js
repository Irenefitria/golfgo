const bcrypt = require("bcryptjs");
const { pool } = require("./db");

// Membuat akun admin pertama dari env var ADMIN_USERNAME/ADMIN_PASSWORD,
// hanya jika tabel admins masih kosong. Aman dipanggil berulang kali saat startup.
async function ensureInitialAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const { rows } = await pool.query("SELECT 1 FROM admins LIMIT 1");
  if (rows.length) return;

  const hash = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO admins (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING", [
    username,
    hash,
  ]);
  console.log(`Admin awal '${username}' berhasil dibuat.`);
}

module.exports = { ensureInitialAdmin };
