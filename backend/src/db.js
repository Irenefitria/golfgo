const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "golfgo",
  password: process.env.DB_PASSWORD || "golfgo",
  database: process.env.DB_NAME || "golfgo",
});

module.exports = { pool };
