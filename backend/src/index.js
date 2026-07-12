require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const coursesRouter = require("./routes/courses");
const lookupsRouter = require("./routes/lookups");
const caddiesRouter = require("./routes/caddies");
const menuRouter = require("./routes/menu");
const bookingsRouter = require("./routes/bookings");

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

app.use((req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GolfGo backend berjalan di port ${PORT}`));
