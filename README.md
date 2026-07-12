# GolfGo — Website Booking Golf

Aplikasi booking tee time golf full-stack, dibangun dari prototype desain "GolfGo":
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js (Express) REST API
- **Database**: PostgreSQL
- **Deploy**: Docker Compose (3 container: db, backend, frontend/nginx)

## Fitur

- Cari & pilih golf course
- Pilih tanggal, jam tee time, jumlah pemain (maks 4), kategori pemain (Umum/Ladies/Junior/Senior), tipe membership — harga otomatis terhitung
- Pilih caddy per pemain (cegah bentrok/dobel booking caddy di slot yang sama)
- Pesan makanan dari menu klub (opsional)
- Pembayaran (simulasi metode: QRIS, VA, e-wallet, kartu kredit) → hasilkan e-ticket dengan kode booking
- Cek booking lewat kode, dengan kebijakan pembatalan/reschedule (>72 jam gratis, 24–72 jam potong 50%, <24 jam potong 100%)

## Menjalankan dengan Docker

Pastikan Docker & Docker Compose sudah terpasang, lalu dari folder root project:

```bash
cp .env.example .env
docker compose up --build
```

Setelah semua container jalan:
- Website: **http://localhost:8080**
- API backend (opsional untuk testing langsung): **http://localhost:4000/api/health**
- PostgreSQL: **localhost:5432** (user/password/db default: `golfgo` / `golfgo` / `golfgo`, ubah di file `.env`)

Database otomatis dibuat & diisi data awal (seed) dari `database/init.sql` saat pertama kali container `db` dibuat (volume kosong). Untuk reset total data:

```bash
docker compose down -v
docker compose up --build
```

## Struktur folder

```
golfgo/
├── docker-compose.yml
├── database/
│   └── init.sql          # skema tabel + seed data
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── index.js       # entry point Express
│       ├── db.js          # koneksi PostgreSQL (pg pool)
│       ├── routes/         # /courses, /caddies, /menu, /bookings, dll
│       └── utils/pricing.js
└── frontend/
    ├── Dockerfile          # build Vite -> serve via Nginx
    ├── nginx.conf          # proxy /api ke backend
    └── src/
        ├── App.jsx
        ├── api.js          # client fetch ke backend
        └── components/     # step-step alur booking
```

## Menjalankan tanpa Docker (mode development)

**Database**: jalankan PostgreSQL lokal, lalu import `database/init.sql`.

**Backend**:
```bash
cd backend
cp .env.example .env   # sesuaikan kredensial DB
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server (port 5173) otomatis proxy `/api` ke `http://localhost:4000` (lihat `vite.config.js`).

## Ringkasan API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/courses` | daftar course (`?search=`) |
| GET | `/api/courses/:id` | detail course |
| GET | `/api/courses/:id/slots?date=YYYY-MM-DD` | slot tersedia |
| GET | `/api/categories` | kategori pemain |
| GET | `/api/memberships` | tipe membership |
| GET | `/api/caddies` | daftar caddy |
| GET | `/api/caddies/availability?date=&slot=` | caddy yang sudah terpakai |
| GET | `/api/menu` | menu restoran (per kategori) |
| POST | `/api/bookings` | buat booking baru |
| GET | `/api/bookings/:code` | detail booking |
| POST | `/api/bookings/:code/cancel` | batalkan booking |
| POST | `/api/bookings/:code/reschedule` | reschedule booking |

## Catatan

- Ini adaptasi dari prototype desain React yang di-upload; alur, harga, dan kebijakan pembatalan mengikuti logika yang sama, hanya sekarang datanya benar-benar tersimpan di PostgreSQL lewat API, bukan mock data di frontend.
- Untuk produksi sungguhan, tambahkan: autentikasi user, integrasi payment gateway asli (Midtrans/Xendit dll — saat ini pembayaran hanya simulasi status `paid`), notifikasi WhatsApp/email, serta HTTPS di depan Nginx.
