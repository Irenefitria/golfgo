require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");
const { ensureInitialAdmin } = require("./seedAdmin");

const coursesRouter = require("./routes/courses");
const lookupsRouter = require("./routes/lookups");
const caddiesRouter = require("./routes/caddies");
const menuRouter = require("./routes/menu");
const bookingsRouter = require("./routes/bookings");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET belum diset di environment. Set nilai rahasia di .env sebelum menjalankan backend.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api/courses", coursesRouter);
app.use("/api", lookupsRouter);
app.use("/api/caddies", caddiesRouter);
app.use("/api/menu", menuRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

const PORT = process.env.PORT || 4000;
ensureInitialAdmin()
  .catch((err) => console.error("Gagal membuat admin awal:", err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`GolfGo backend berjalan di port ${PORT}`));
  });
