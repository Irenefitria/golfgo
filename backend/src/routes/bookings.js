const express = require("express");
const { pool } = require("../db");
const {
  computePlayerRate,
  generateBookingCode,
  cancellationFeePct,
  hoursUntilTeeTime,
} = require("../utils/pricing");

const router = express.Router();

// POST /api/bookings
// body: { courseId, date, slot, players: [{name, categoryId, membershipId, caddyId}], food: [{menuItemId, qty}], paymentMethod, contactName, contactPhone }
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { courseId, date, slot, players, food = [], paymentMethod, contactName, contactPhone } = req.body;

    if (!courseId || !date || !slot || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: "Data booking tidak lengkap" });
    }
    if (players.length > 4) {
      return res.status(400).json({ error: "Maksimal 4 pemain per booking" });
    }

    await client.query("BEGIN");

    const { rows: courseRows } = await client.query("SELECT * FROM courses WHERE id = $1 FOR UPDATE", [courseId]);
    if (!courseRows.length) throw { status: 404, message: "Course tidak ditemukan" };
    const course = courseRows[0];

    // cek slot masih tersedia
    const { rows: existing } = await client.query(
      `SELECT id FROM bookings WHERE course_id = $1 AND booking_date = $2 AND time_slot = $3
       AND status IN ('pending','paid')`,
      [courseId, date, slot]
    );
    if (existing.length) throw { status: 409, message: "Slot tee time ini sudah dibooking, silakan pilih slot lain" };

    // ambil master kategori & membership
    const { rows: categories } = await client.query("SELECT * FROM player_categories");
    const { rows: memberships } = await client.query("SELECT * FROM membership_types");
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
    const memMap = Object.fromEntries(memberships.map((m) => [m.id, m]));

    // validasi caddy tidak bentrok dalam booking ini & belum dipakai booking lain di slot yg sama
    const caddyIds = players.map((p) => p.caddyId).filter(Boolean);
    if (new Set(caddyIds).size !== caddyIds.length) {
      throw { status: 400, message: "Satu caddy tidak bisa dipilih untuk lebih dari satu pemain" };
    }
    if (caddyIds.length) {
      const { rows: takenCaddies } = await client.query(
        `SELECT DISTINCT bp.caddy_id FROM booking_players bp
         JOIN bookings b ON b.id = bp.booking_id
         WHERE b.booking_date = $1 AND b.time_slot = $2 AND b.status IN ('pending','paid')
           AND bp.caddy_id = ANY($3::varchar[])`,
        [date, slot, caddyIds]
      );
      if (takenCaddies.length) throw { status: 409, message: "Salah satu caddy sudah dipesan untuk jadwal ini" };
    }

    // resolve ID member ke nama & tipe membership resmi dari database
    // (server yang jadi sumber kebenaran, bukan input klien, supaya diskon member
    // tidak bisa diklaim tanpa ID yang valid)
    const memberByCode = {};
    for (const p of players) {
      const code = (p.memberCode || "").trim();
      if (!code || memberByCode[code.toUpperCase()]) continue;
      const { rows: memberRows } = await client.query(
        "SELECT * FROM members WHERE upper(member_code) = upper($1) AND active = true",
        [code]
      );
      if (!memberRows.length) throw { status: 400, message: `ID Member '${code}' tidak ditemukan` };
      memberByCode[code.toUpperCase()] = memberRows[0];
    }

    let slotTotal = 0;
    const computedPlayers = players.map((p, idx) => {
      const code = (p.memberCode || "").trim();
      const member = code ? memberByCode[code.toUpperCase()] : null;
      const resolvedName = member ? member.name : p.name;
      const resolvedMembershipId = member ? member.membership_id : p.membershipId;

      const cat = catMap[p.categoryId] || categories[0];
      const mem = memMap[resolvedMembershipId] || memberships[0];
      const rate = computePlayerRate(course, date, cat, mem);
      slotTotal += rate;
      return { ...p, index: idx, rate, categoryId: cat.id, membershipId: mem.id, name: resolvedName, memberCode: code || null };
    });

    let caddyTotal = 0;
    if (caddyIds.length) {
      const { rows: caddyRows } = await client.query("SELECT * FROM caddies WHERE id = ANY($1::varchar[])", [caddyIds]);
      const feeMap = Object.fromEntries(caddyRows.map((c) => [c.id, Number(c.fee)]));
      caddyTotal = caddyIds.reduce((sum, id) => sum + (feeMap[id] || 0), 0);
    }

    let foodTotal = 0;
    let foodRows = [];
    if (food.length) {
      const menuIds = food.map((f) => f.menuItemId);
      const { rows: menuItems } = await client.query("SELECT * FROM menu_items WHERE id = ANY($1::varchar[])", [menuIds]);
      const priceMap = Object.fromEntries(menuItems.map((m) => [m.id, Number(m.price)]));
      foodRows = food
        .filter((f) => f.qty > 0 && priceMap[f.menuItemId] != null)
        .map((f) => ({ menuItemId: f.menuItemId, qty: f.qty, price: priceMap[f.menuItemId] }));
      foodTotal = foodRows.reduce((sum, f) => sum + f.qty * f.price, 0);
    }

    const grandTotal = slotTotal + caddyTotal + foodTotal;
    const bookingCode = generateBookingCode();

    const { rows: inserted } = await client.query(
      `INSERT INTO bookings
        (booking_code, course_id, booking_date, time_slot, status, payment_method,
         slot_total, caddy_total, food_total, grand_total, contact_name, contact_phone)
       VALUES ($1,$2,$3,$4,'paid',$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [bookingCode, courseId, date, slot, paymentMethod || null, slotTotal, caddyTotal, foodTotal, grandTotal, contactName || null, contactPhone || null]
    );
    const booking = inserted[0];

    for (const p of computedPlayers) {
      await client.query(
        `INSERT INTO booking_players (booking_id, player_index, name, category_id, membership_id, caddy_id, player_rate, member_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [booking.id, p.index, p.name || null, p.categoryId, p.membershipId, p.caddyId || null, p.rate, p.memberCode]
      );
    }
    for (const f of foodRows) {
      await client.query(
        `INSERT INTO booking_food_items (booking_id, menu_item_id, quantity, price_each) VALUES ($1,$2,$3,$4)`,
        [booking.id, f.menuItemId, f.qty, f.price]
      );
    }
    await client.query(
      `INSERT INTO booking_events (booking_id, event_type, meta) VALUES ($1,'created',$2)`,
      [booking.id, JSON.stringify({ paymentMethod })]
    );

    await client.query("COMMIT");

    const full = await getFullBooking(booking.booking_code);
    res.status(201).json(full);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Gagal membuat booking" });
  } finally {
    client.release();
  }
});

// GET /api/bookings/:code
router.get("/:code", async (req, res) => {
  try {
    const full = await getFullBooking(req.params.code);
    if (!full) return res.status(404).json({ error: "Booking tidak ditemukan" });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil booking" });
  }
});

// POST /api/bookings/:code/cancel
router.post("/:code/cancel", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT * FROM bookings WHERE booking_code = $1 FOR UPDATE", [req.params.code]);
    if (!rows.length) throw { status: 404, message: "Booking tidak ditemukan" };
    const booking = rows[0];
    if (booking.status === "cancelled") throw { status: 400, message: "Booking sudah dibatalkan sebelumnya" };

    const hoursLeft = hoursUntilTeeTime(booking.booking_date, booking.time_slot);
    const feePct = cancellationFeePct(hoursLeft);
    const fee = Math.round((Number(booking.grand_total) * feePct) / 100);
    const refund = Number(booking.grand_total) - fee;

    await client.query("UPDATE bookings SET status='cancelled', updated_at=now() WHERE id=$1", [booking.id]);
    await client.query(
      "INSERT INTO booking_events (booking_id, event_type, meta) VALUES ($1,'cancelled',$2)",
      [booking.id, JSON.stringify({ feePct, fee, refund, hoursLeft })]
    );
    await client.query("COMMIT");

    res.json({ status: "cancelled", feePct, fee, refund });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Gagal membatalkan booking" });
  } finally {
    client.release();
  }
});

// POST /api/bookings/:code/reschedule  body: { newSlot }
router.post("/:code/reschedule", async (req, res) => {
  const client = await pool.connect();
  try {
    const { newSlot } = req.body;
    if (!newSlot) return res.status(400).json({ error: "newSlot wajib diisi" });

    await client.query("BEGIN");
    const { rows } = await client.query("SELECT * FROM bookings WHERE booking_code = $1 FOR UPDATE", [req.params.code]);
    if (!rows.length) throw { status: 404, message: "Booking tidak ditemukan" };
    const booking = rows[0];
    if (booking.status !== "paid") throw { status: 400, message: "Hanya booking aktif yang bisa dijadwal ulang" };

    const { rows: clashing } = await client.query(
      `SELECT id FROM bookings WHERE course_id=$1 AND booking_date=$2 AND time_slot=$3
       AND status IN ('pending','paid') AND id != $4`,
      [booking.course_id, booking.booking_date, newSlot, booking.id]
    );
    if (clashing.length) throw { status: 409, message: "Slot baru sudah dibooking orang lain" };

    const hoursLeft = hoursUntilTeeTime(booking.booking_date, booking.time_slot);
    const feePct = cancellationFeePct(hoursLeft);
    const fee = Math.round((Number(booking.grand_total) * feePct) / 100);

    await client.query(
      "UPDATE bookings SET time_slot=$1, status='paid', updated_at=now() WHERE id=$2",
      [newSlot, booking.id]
    );
    await client.query(
      "INSERT INTO booking_events (booking_id, event_type, meta) VALUES ($1,'rescheduled',$2)",
      [booking.id, JSON.stringify({ oldSlot: booking.time_slot, newSlot, feePct, fee })]
    );
    await client.query("COMMIT");

    res.json({ status: "rescheduled", newSlot, feePct, fee });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Gagal reschedule booking" });
  } finally {
    client.release();
  }
});

async function getFullBooking(code) {
  const { rows } = await pool.query(
    `SELECT b.*, c.name AS course_name, c.location AS course_location
     FROM bookings b JOIN courses c ON c.id = b.course_id
     WHERE b.booking_code = $1`,
    [code]
  );
  if (!rows.length) return null;
  const booking = rows[0];

  const { rows: players } = await pool.query(
    `SELECT bp.*, pc.label AS category_label, pc.short_label AS category_short,
            mt.label AS membership_label, cd.name AS caddy_name
     FROM booking_players bp
     LEFT JOIN player_categories pc ON pc.id = bp.category_id
     LEFT JOIN membership_types mt ON mt.id = bp.membership_id
     LEFT JOIN caddies cd ON cd.id = bp.caddy_id
     WHERE bp.booking_id = $1 ORDER BY bp.player_index`,
    [booking.id]
  );

  const { rows: foodItems } = await pool.query(
    `SELECT bf.*, mi.name AS item_name FROM booking_food_items bf
     JOIN menu_items mi ON mi.id = bf.menu_item_id
     WHERE bf.booking_id = $1`,
    [booking.id]
  );

  return { ...booking, players, foodItems };
}

module.exports = router;
