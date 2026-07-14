import React, { useState, useMemo } from "react";
import {
  MapPin, Star, Calendar, Clock, Users, Flag, UtensilsCrossed,
  CreditCard, CheckCircle2, ChevronRight, ChevronLeft, Plus, Minus,
  X, QrCode, AlertTriangle, Search, ArrowRight, RotateCcw,
  LogOut, User, Lock, Phone
} from "lucide-react";

// ---------- Design tokens ----------
const C = {
  fairway900: "#16342A",
  fairway700: "#2D5F45",
  fairway600: "#3A7256",
  ivory: "#FAF8F2",
  sand: "#E4D9BE",
  sandDark: "#CFC09A",
  flag: "#C1440E",
  flagDark: "#9C3509",
  ink: "#1F2420",
  inkSoft: "#5B655D",
  line: "#DCD4C0",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

// ---------- Mock data ----------
const COURSES = [
  { id: "c1", name: "Sentul Highlands Golf Club", loc: "Sentul City, Bogor", rating: 4.7, reviews: 386, tone: C.fairway700, baseRate: { weekday: 700000, weekend: 1800000 } },
  { id: "c2", name: "Rainbow Hills Golf Club", loc: "Sentul, Bogor", rating: 4.6, reviews: 251, tone: C.flagDark, baseRate: { weekday: 850000, weekend: 2000000 } },
  { id: "c3", name: "Royale Jakarta Golf Club", loc: "Halim Perdanakusuma, Jakarta Timur", rating: 4.8, reviews: 512, tone: "#8A6D3B", baseRate: { weekday: 1500000, weekend: 2800000 } },
];

// kategori pemain — rate mengikuti multiplier dari harga dasar (baseRate) per course
const CATEGORIES = [
  { id: "pria", label: "Umum", short: "Umum", multiplier: 1.0 },
  { id: "wanita", label: "Ladies", short: "Ladies", multiplier: 0.85 },
  { id: "junior", label: "Junior (< 18 th)", short: "Junior", multiplier: 0.5 },
  { id: "senior", label: "Senior (60+ th)", short: "Senior", multiplier: 0.75 },
];

// tipe member — potongan tambahan di atas rate kategori
const MEMBERSHIPS = [
  { id: "umum", label: "Non-member", discount: 0 },
  { id: "member", label: "Member Klub", discount: 0.3 },
  { id: "golfgo", label: "GolfGo Member", discount: 0.1 },
];

const isWeekendDate = (d) => d.startsWith("Sab") || d.startsWith("Min");

const playerRate = (course, date, player) => {
  const cat = CATEGORIES.find((c) => c.id === player.category) || CATEGORIES[0];
  const mem = MEMBERSHIPS.find((m) => m.id === player.membership) || MEMBERSHIPS[0];
  const base = course.baseRate[isWeekendDate(date) ? "weekend" : "weekday"];
  return Math.round(base * cat.multiplier * (1 - mem.discount));
};

const SLOTS = ["06:00", "06:30", "07:00", "07:30", "09:00", "10:30", "13:00", "14:30"];

const CADDIES = [
  { id: "cd1", name: "Bambang S.", exp: 8, rating: 4.9 },
  { id: "cd2", name: "Rini A.", exp: 5, rating: 4.8 },
  { id: "cd3", name: "Yusuf H.", exp: 12, rating: 5.0 },
  { id: "cd4", name: "Dewi P.", exp: 3, rating: 4.6 },
];

const MENU = {
  "Minuman": [
    { id: "m1", name: "Es Kelapa Muda", price: 35000 },
    { id: "m2", name: "Kopi Susu Gula Aren", price: 32000 },
    { id: "m3", name: "Jus Alpukat", price: 38000 },
  ],
  "Makanan Berat": [
    { id: "m4", name: "Nasi Goreng Fairway", price: 65000 },
    { id: "m5", name: "Sate Ayam Madura (10 tusuk)", price: 58000 },
    { id: "m6", name: "Soto Betawi", price: 62000 },
  ],
  "Snack": [
    { id: "m7", name: "Pisang Goreng Keju", price: 28000 },
    { id: "m8", name: "Kentang Goreng", price: 30000 },
  ],
};

const STEPS = ["Jadwal", "Caddy", "Makanan", "Pembayaran"];

const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

// ---------- Small building blocks ----------
function Stepper({ current }) {
  return (
    <div className="flex items-center w-full max-w-2xl mx-auto mb-8 px-2">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                backgroundColor: i <= current ? C.fairway700 : "transparent",
                color: i <= current ? C.ivory : C.inkSoft,
                border: `1.5px solid ${i <= current ? C.fairway700 : C.line}`,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <span
              className="text-xs hidden sm:block"
              style={{ color: i === current ? C.ink : C.inkSoft, fontFamily: "'Inter', sans-serif", fontWeight: i === current ? 600 : 400 }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-[1.5px] mx-2" style={{ backgroundColor: i < current ? C.fairway700 : C.line }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled, className = "", icon: Icon }) {
  const styles = {
    primary: { backgroundColor: disabled ? C.sandDark : C.flag, color: C.ivory },
    ghost: { backgroundColor: "transparent", color: C.fairway900, border: `1.5px solid ${C.line}` },
    dark: { backgroundColor: C.fairway900, color: C.ivory },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${disabled ? "cursor-not-allowed" : "hover:opacity-90"} ${className}`}
      style={{ ...styles[variant], fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <div className="text-xs tracking-[0.18em] uppercase mb-1" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>{eyebrow}</div>
      <h2 style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontSize: "28px", fontWeight: 600 }}>{title}</h2>
    </div>
  );
}

// perforated "scorecard ticket" — the signature element
function TicketCard({ children, footer }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
      <div className="p-6">{children}</div>
      <div className="relative h-0">
        <div className="absolute left-0 right-0 border-t border-dashed" style={{ borderColor: C.line, top: 0 }} />
        <div className="absolute w-6 h-6 rounded-full" style={{ backgroundColor: C.ivory, left: -12, top: -12 }} />
        <div className="absolute w-6 h-6 rounded-full" style={{ backgroundColor: C.ivory, right: -12, top: -12 }} />
      </div>
      {footer && <div className="p-6 pt-5">{footer}</div>}
    </div>
  );
}

// ---------- Main App ----------
export default function GolfBookingPrototype() {
  const [session, setSession] = useState(null); // null | { name, phone }
  const [tab, setTab] = useState("book"); // book | manage
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(null);
  const [date, setDate] = useState("Sab, 18 Jul 2026");
  const [slot, setSlot] = useState(null);
  const [playersList, setPlayersList] = useState([
    { id: "p1", name: "", caddyId: null, category: "pria", membership: "umum" },
    { id: "p2", name: "", caddyId: null, category: "pria", membership: "umum" },
  ]);
  const [cart, setCart] = useState({});
  const [paid, setPaid] = useState(false);

  const addItem = (id, delta) => setCart((c) => {
    const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
    if (next[id] === 0) delete next[id];
    return next;
  });

  const allItems = useMemo(() => Object.values(MENU).flat(), []);
  const cartTotal = useMemo(
    () => Object.entries(cart).reduce((sum, [id, qty]) => sum + qty * allItems.find((i) => i.id === id).price, 0),
    [cart, allItems]
  );
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const slotTotal = course ? playersList.reduce((sum, p) => sum + playerRate(course, date, p), 0) : 0;
  const grandTotal = slotTotal + cartTotal;

  const goCourseDetail = (c) => { setCourse(c); setStep(0); setSlot(null); };
  const canNextFromSchedule = !!slot;

  const resetAll = () => {
    setCourse(null); setStep(0); setSlot(null);
    setPlayersList([
      { id: "p1", name: session ? session.name : "", caddyId: null, category: "pria", membership: "umum" },
      { id: "p2", name: "", caddyId: null, category: "pria", membership: "umum" },
    ]);
    setCart({}); setPaid(false);
  };

  const handleLogin = (user) => {
    setSession(user);
    // akun yang login otomatis jadi Pemain 1 — pemain lain (maks. 4) tinggal diinput namanya, tanpa perlu login terpisah
    setPlayersList((list) => list.map((p, i) => (i === 0 ? { ...p, name: user.name } : p)));
  };

  const handleLogout = () => {
    setSession(null); setTab("book"); setCourse(null); setStep(0); setSlot(null);
    setPlayersList([
      { id: "p1", name: "", caddyId: null, category: "pria", membership: "umum" },
      { id: "p2", name: "", caddyId: null, category: "pria", membership: "umum" },
    ]);
    setCart({}); setPaid(false);
  };

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100%", color: C.ink, fontFamily: "'Inter', sans-serif" }}>
      <style>{fontImport}</style>

      {/* Top nav */}
      <div style={{ backgroundColor: C.fairway900 }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Flag size={20} color={C.sand} />
          <span style={{ fontFamily: "'Fraunces', serif", color: C.ivory, fontWeight: 600, fontSize: "20px" }}>GolfGo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full p-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            {[["book", "Booking"], ["manage", "Booking Saya"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: tab === key ? C.ivory : "transparent",
                  color: tab === key ? C.fairway900 : C.sand,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: C.sand, color: C.fairway900, fontFamily: "'IBM Plex Mono', monospace" }}>
              {session.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block" style={{ color: C.ivory }}>{session.name}</span>
            <button onClick={handleLogout} title="Keluar" className="w-7 h-7 rounded-full flex items-center justify-center" style={{ color: C.sand }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {tab === "book" && !course && <CourseList onSelect={goCourseDetail} />}

        {tab === "book" && course && !paid && (
          <>
            <button onClick={() => setCourse(null)} className="flex items-center gap-1 text-sm mb-6" style={{ color: C.inkSoft }}>
              <ChevronLeft size={16} /> Kembali ke daftar course
            </button>
            <Stepper current={step} />
            {step === 0 && (
              <ScheduleStep course={course} date={date} setDate={setDate} slot={slot} setSlot={setSlot}
                playersList={playersList} setPlayersList={setPlayersList} onNext={() => setStep(1)} canNext={canNextFromSchedule} />
            )}
            {step === 1 && (
              <CaddyStep playersList={playersList} setPlayersList={setPlayersList} onNext={() => setStep(2)} onBack={() => setStep(0)} />
            )}
            {step === 2 && (
              <FoodStep cart={cart} addItem={addItem} cartTotal={cartTotal} cartCount={cartCount}
                onNext={() => setStep(3)} onBack={() => setStep(1)} />
            )}
            {step === 3 && (
              <PaymentStep course={course} date={date} slot={slot} playersList={playersList}
                cart={cart} allItems={allItems} slotTotal={slotTotal}
                cartTotal={cartTotal} grandTotal={grandTotal} onBack={() => setStep(2)}
                onPay={() => setPaid(true)} />
            )}
          </>
        )}

        {tab === "book" && course && paid && (
          <Confirmation course={course} date={date} slot={slot} playersList={playersList}
            total={grandTotal} onDone={resetAll} />
        )}

        {tab === "manage" && <ManageBooking />}
      </div>
    </div>
  );
}

// ---------- Login gate — 1 akun untuk booking sampai 4 pemain sekaligus ----------
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | daftar
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError("Nama, No. WhatsApp, dan password wajib diisi.");
      return;
    }
    setError("");
    onLogin({ name, phone });
  };

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100%", fontFamily: "'Inter', sans-serif" }} className="flex items-center justify-center px-6 py-12">
      <style>{fontImport}</style>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: C.fairway900 }}>
            <Flag size={22} color={C.sand} />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontWeight: 600, fontSize: "24px" }}>GolfGo</h1>
          <p className="text-xs mt-1" style={{ color: C.inkSoft }}>Booking tee time, caddy & makanan di berbagai golf course</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl p-6 space-y-3" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
          <div className="text-sm font-semibold mb-1" style={{ color: C.fairway900 }}>
            {mode === "login" ? "Masuk ke akun kamu" : "Buat akun baru"}
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: C.inkSoft }}>Nama lengkap</label>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{ border: `1px solid ${C.line}` }}>
              <User size={15} color={C.inkSoft} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pemesan (Pemain 1)"
                className="flex-1 text-sm py-2.5 outline-none bg-transparent" />
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: C.inkSoft }}>No. WhatsApp</label>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{ border: `1px solid ${C.line}` }}>
              <Phone size={15} color={C.inkSoft} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx xxxx xxxx"
                className="flex-1 text-sm py-2.5 outline-none bg-transparent" />
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: C.inkSoft }}>Password</label>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{ border: `1px solid ${C.line}` }}>
              <Lock size={15} color={C.inkSoft} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="flex-1 text-sm py-2.5 outline-none bg-transparent" />
            </div>
          </div>

          {error && (
            <div className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "#FBEAE0", color: C.flagDark }}>{error}</div>
          )}

          <Button className="w-full mt-2" onClick={submit}>
            {mode === "login" ? "Masuk" : "Daftar & mulai booking"}
          </Button>

          <button type="button" onClick={() => setMode(mode === "login" ? "daftar" : "login")} className="w-full text-center text-xs pt-1" style={{ color: C.fairway700 }}>
            {mode === "login" ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk"}
          </button>
        </form>

        <p className="text-[11px] text-center mt-5" style={{ color: C.inkSoft }}>
          1 akun bisa dipakai untuk booking sampai 4 pemain sekaligus — pemain lain cukup diisi namanya saat booking, tanpa perlu akun terpisah.
        </p>
      </div>
    </div>
  );
}

// ---------- Course list ----------
function CourseList({ onSelect }) {
  return (
    <div>
      <SectionTitle eyebrow="Cari & Pesan" title="Mau main golf di mana hari ini?" />
      <div className="flex items-center gap-3 rounded-full px-5 py-3 mb-8" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
        <Search size={18} color={C.inkSoft} />
        <input placeholder="Cari nama course atau kota..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.ink }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {COURSES.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)} className="text-left rounded-2xl overflow-hidden group transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
            <div className="h-32 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${c.tone}, ${C.fairway900})` }}>
              <Flag size={22} color={C.ivory} style={{ opacity: 0.85 }} />
            </div>
            <div className="p-5">
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", fontWeight: 600, color: C.fairway900 }}>{c.name}</h3>
              <div className="flex items-center gap-1 text-xs mt-1" style={{ color: C.inkSoft }}>
                <MapPin size={13} /> {c.loc}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} fill={C.flag} color={C.flag} />
                  <span style={{ fontWeight: 600 }}>{c.rating}</span>
                  <span style={{ color: C.inkSoft }}>({c.reviews})</span>
                </div>
                <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>
                  mulai {rupiah(c.baseRate.weekday)}<span className="text-xs" style={{ color: C.inkSoft }}>/hari kerja</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 1: Schedule ----------
function ScheduleStep({ course, date, setDate, slot, setSlot, playersList, setPlayersList, onNext, canNext }) {
  const dates = ["Sab, 18 Jul 2026", "Min, 19 Jul 2026", "Sen, 20 Jul 2026", "Sel, 21 Jul 2026"];
  const weekend = isWeekendDate(date);

  const addPlayer = () => setPlayersList((list) => list.length >= 4 ? list : [...list, { id: `p${list.length + 1}`, name: "", caddyId: null, category: "pria", membership: "umum" }]);
  const removePlayer = () => setPlayersList((list) => list.length <= 1 ? list : list.slice(0, -1));
  const updatePlayer = (idx, patch) => setPlayersList((list) => list.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  return (
    <div>
      <SectionTitle eyebrow={course.name} title="Pilih tanggal & jam tee time" />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {dates.map((d) => (
          <button key={d} onClick={() => setDate(d)} className="px-4 py-2 rounded-full text-sm whitespace-nowrap"
            style={{ backgroundColor: date === d ? C.fairway700 : "#fff", color: date === d ? C.ivory : C.ink, border: `1px solid ${date === d ? C.fairway700 : C.line}` }}>
            <Calendar size={13} className="inline mr-1.5 -mt-0.5" />{d}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {SLOTS.map((t) => (
          <button key={t} onClick={() => setSlot(t)} className="py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: slot === t ? C.flag : "#fff", color: slot === t ? C.ivory : C.ink, border: `1px solid ${slot === t ? C.flag : C.line}`, fontFamily: "'IBM Plex Mono', monospace" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tabel referensi harga per kategori */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: C.sand }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.fairway900, fontFamily: "'IBM Plex Mono', monospace" }}>
            Rate {weekend ? "akhir pekan" : "hari kerja"}
          </span>
          <span className="text-xs" style={{ color: C.inkSoft }}>{weekend ? "Sab–Min" : "Sen–Jum"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="rounded-lg p-3 text-center" style={{ backgroundColor: "#fff" }}>
              <div className="text-xs mb-1" style={{ color: C.inkSoft }}>{cat.short}</div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.fairway900 }}>
                {rupiah(Math.round(course.baseRate[weekend ? "weekend" : "weekday"] * cat.multiplier))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px]" style={{ color: C.inkSoft }}>
          Member klub -30% &middot; GolfGo Member -10% dari rate di atas. Diskon diterapkan otomatis per pemain di bawah.
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Users size={18} color={C.inkSoft} /><span className="text-sm font-medium">Data pemain (maks. 4)</span></div>
          <div className="flex items-center gap-4">
            <button onClick={removePlayer} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}><Minus size={14} /></button>
            <span className="w-4 text-center font-semibold">{playersList.length}</span>
            <button onClick={addPlayer} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}><Plus size={14} /></button>
          </div>
        </div>
        <div className="space-y-3">
          {playersList.map((p, idx) => (
            <div key={p.id} className="rounded-xl p-3" style={{ backgroundColor: C.ivory }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: C.sand, color: C.fairway900, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {idx + 1}
                </div>
                <input
                  value={p.name}
                  onChange={(e) => updatePlayer(idx, { name: e.target.value })}
                  placeholder={`Nama pemain ${idx + 1}`}
                  className="flex-1 text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pl-10">
                <select
                  value={p.category}
                  onChange={(e) => updatePlayer(idx, { category: e.target.value })}
                  className="text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff", color: C.ink }}
                >
                  {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
                <select
                  value={p.membership}
                  onChange={(e) => updatePlayer(idx, { membership: e.target.value })}
                  className="text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff", color: C.ink }}
                >
                  {MEMBERSHIPS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div className="text-right text-xs font-semibold mt-2 pr-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>
                {rupiah(playerRate(course, date, p))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canNext} icon={ChevronRight}>Lanjut pilih caddy</Button>
      </div>
    </div>
  );
}

// ---------- Step 2: Caddy per player ----------
function CaddyStep({ playersList, setPlayersList, onNext, onBack }) {
  const setCaddyFor = (idx, caddyId) => setPlayersList((list) => list.map((p, i) => (i === idx ? { ...p, caddyId } : p)));
  const takenBy = (caddyId, exceptIdx) => playersList.findIndex((p, i) => i !== exceptIdx && p.caddyId === caddyId);

  return (
    <div>
      <SectionTitle eyebrow="Opsional, per pemain" title="Pilih caddy untuk tiap pemain" />
      <div className="space-y-5 mb-8">
        {playersList.map((p, idx) => (
          <div key={p.id} className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: C.fairway700, color: C.ivory, fontFamily: "'IBM Plex Mono', monospace" }}>
                {idx + 1}
              </div>
              <span className="text-sm font-semibold" style={{ color: C.fairway900 }}>{p.name || `Pemain ${idx + 1}`}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <button onClick={() => setCaddyFor(idx, null)} className="text-left px-4 py-2.5 rounded-xl text-xs"
                style={{ backgroundColor: !p.caddyId ? C.sand : C.ivory, border: `1.5px solid ${!p.caddyId ? C.sandDark : C.line}` }}>
                Tanpa caddy
              </button>
              {CADDIES.map((cd) => {
                const takenIdx = takenBy(cd.id, idx);
                const disabled = takenIdx !== -1;
                return (
                  <button key={cd.id} disabled={disabled} onClick={() => setCaddyFor(idx, cd.id)}
                    className="text-left px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: p.caddyId === cd.id ? C.sand : disabled ? "#f2f0ea" : C.ivory,
                      border: `1.5px solid ${p.caddyId === cd.id ? C.sandDark : C.line}`,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}>
                    <span>
                      <span className="font-medium">{cd.name}</span>
                      <span style={{ color: C.inkSoft }}> · {cd.exp}th · ⭐{cd.rating}</span>
                    </span>
                    {disabled && <span style={{ color: C.inkSoft, whiteSpace: "nowrap" }}>dipilih P{takenIdx + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
        <Button onClick={onNext} icon={ChevronRight}>Lanjut pesan makanan</Button>
      </div>
    </div>
  );
}

// ---------- Step 3: Food ----------
function FoodStep({ cart, addItem, cartTotal, cartCount, onNext, onBack }) {
  return (
    <div>
      <SectionTitle eyebrow="Club House Restaurant" title="Pesan makanan sekalian? (opsional)" />
      <div className="space-y-8 mb-6">
        {Object.entries(MENU).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: C.fairway900 }}>
              <UtensilsCrossed size={15} /> {cat}
            </h3>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs" style={{ color: C.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(it.price)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => addItem(it.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}><Minus size={12} /></button>
                    <span className="w-4 text-center text-sm">{cart[it.id] || 0}</span>
                    <button onClick={() => addItem(it.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: C.fairway700, color: C.ivory }}><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {cartCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl mb-6" style={{ backgroundColor: C.sand }}>
          <span className="text-sm font-medium">{cartCount} item dipilih</span>
          <span className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(cartTotal)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
        <Button onClick={onNext} icon={ChevronRight}>{cartCount > 0 ? "Lanjut ke pembayaran" : "Lewati, ke pembayaran"}</Button>
      </div>
    </div>
  );
}

// ---------- Step 4: Payment ----------
function PaymentStep({ course, date, slot, playersList, cart, allItems, slotTotal, cartTotal, grandTotal, onBack, onPay }) {
  const [method, setMethod] = useState("qris");
  const methods = [
    { id: "qris", label: "QRIS" },
    { id: "va", label: "Virtual Account" },
    { id: "ewallet", label: "GoPay / OVO / Dana" },
    { id: "cc", label: "Kartu Kredit" },
  ];
  return (
    <div>
      <SectionTitle eyebrow="Ringkasan" title="Konfirmasi & bayar" />
      <div className="grid md:grid-cols-2 gap-6">
        <TicketCard
          footer={
            <div className="space-y-2">
              {playersList.map((p, i) => {
                const cat = CATEGORIES.find((c) => c.id === p.category);
                const mem = MEMBERSHIPS.find((m) => m.id === p.membership);
                const label = `${p.name || "Pemain " + (i + 1)} (${cat.short}${mem.id !== "umum" ? ", " + mem.label : ""})`;
                return <Row key={p.id} raw={rupiah(playerRate(course, date, p))} label={label} />;
              })}
              {cartTotal > 0 && <Row raw={rupiah(cartTotal)} label="Makanan" />}
              <div className="flex justify-between pt-3 mt-1" style={{ borderTop: `1px dashed ${C.line}` }}>
                <span className="font-semibold text-sm">Total</span>
                <span className="font-bold text-base" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(grandTotal)}</span>
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-2 mb-1">
            <Flag size={14} color={C.flag} />
            <span className="text-xs uppercase tracking-wide" style={{ color: C.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>e-Ticket</span>
          </div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "20px", color: C.fairway900 }}>{course.name}</h3>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm mb-4">
            <div><div className="text-xs" style={{ color: C.inkSoft }}>Tanggal</div><div className="font-medium">{date}</div></div>
            <div><div className="text-xs" style={{ color: C.inkSoft }}>Jam</div><div className="font-medium">{slot}</div></div>
          </div>
          <div className="text-xs mb-2" style={{ color: C.inkSoft }}>Pemain & caddy</div>
          <div className="space-y-1.5">
            {playersList.map((p, i) => {
              const cd = CADDIES.find((c) => c.id === p.caddyId);
              const cat = CATEGORIES.find((c) => c.id === p.category);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {p.name || `Pemain ${i + 1}`} <span style={{ color: C.inkSoft, fontSize: "11px" }}>({cat.short})</span></span>
                  <span style={{ color: cd ? C.fairway700 : C.inkSoft, fontSize: "12px" }}>{cd ? cd.name : "tanpa caddy"}</span>
                </div>
              );
            })}
          </div>
        </TicketCard>

        <div>
          <div className="text-sm font-semibold mb-3">Metode pembayaran</div>
          <div className="space-y-2 mb-8">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)} className="w-full flex items-center justify-between p-4 rounded-xl text-sm"
                style={{ backgroundColor: method === m.id ? C.sand : "#fff", border: `1.5px solid ${method === m.id ? C.sandDark : C.line}` }}>
                <span className="flex items-center gap-2"><CreditCard size={15} />{m.label}</span>
                {method === m.id && <CheckCircle2 size={16} color={C.fairway700} />}
              </button>
            ))}
          </div>
          <div className="rounded-xl p-4 mb-6 flex gap-2 text-xs" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}`, color: C.inkSoft }}>
            <AlertTriangle size={26} color={C.flag} className="flex-shrink-0" />
            Pembatalan &lt;24 jam sebelum tee time dikenakan biaya 100%. Lihat kebijakan lengkap di tab "Booking Saya" setelah konfirmasi.
          </div>
          <Button onClick={onPay} className="w-full">Bayar {rupiah(grandTotal)}</Button>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
      </div>
    </div>
  );
}

function Row({ label, raw }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{raw}</span>
    </div>
  );
}

// ---------- Confirmation ----------
function Confirmation({ course, date, slot, playersList, total, onDone }) {
  return (
    <div className="max-w-lg mx-auto text-center py-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: C.fairway700 }}>
        <CheckCircle2 size={30} color={C.ivory} />
      </div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600, color: C.fairway900 }} className="mb-2">Booking terkonfirmasi</h2>
      <p className="text-sm mb-8" style={{ color: C.inkSoft }}>E-ticket telah dikirim via WhatsApp. Tunjukkan QR ini saat check-in di club house.</p>
      <TicketCard footer={<div className="text-xs text-center" style={{ color: C.inkSoft }}>Kode booking <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.ink, fontWeight: 600 }}>GG-28417</span></div>}>
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.fairway900 }}>
            <QrCode size={64} color={C.ivory} />
          </div>
        </div>
        <div className="text-sm font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900 }}>{course.name}</div>
        <div className="text-xs mt-1 mb-3" style={{ color: C.inkSoft }}>{date} &middot; {slot} &middot; {playersList.length} pemain</div>
        <div className="space-y-1 text-left max-w-[240px] mx-auto">
          {playersList.map((p, i) => {
            const cd = CADDIES.find((c) => c.id === p.caddyId);
            return (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span>{i + 1}. {p.name || `Pemain ${i + 1}`}</span>
                <span style={{ color: cd ? C.fairway700 : C.inkSoft }}>{cd ? cd.name : "—"}</span>
              </div>
            );
          })}
        </div>
        <div className="text-sm font-bold mt-3" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(total)}</div>
      </TicketCard>
      <div className="mt-8">
        <Button onClick={onDone} variant="dark">Buat booking baru</Button>
      </div>
    </div>
  );
}

// modal popup — dipakai untuk konfirmasi pembatalan agar jelas terlihat
function Modal({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(22,52,42,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ border: `1px solid ${C.line}`, color: C.inkSoft }}
        >
          <X size={14} />
        </button>
        {children}
      </div>
    </div>
  );
}
function ManageBooking() {
  const [hoursLeft, setHoursLeft] = useState(48);
  const [action, setAction] = useState(null); // 'cancel' | 'reschedule' | null
  const [newSlot, setNewSlot] = useState(null);
  const [done, setDone] = useState(null);

  const total = 1400000; // contoh booking existing: 2 pemain @ Rp700.000, caddy gratis
  const feePct = hoursLeft >= 72 ? 0 : hoursLeft >= 24 ? 50 : 100;
  const fee = Math.round((total * feePct) / 100);
  const refund = total - fee;

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <CheckCircle2 size={40} color={C.fairway700} className="mx-auto mb-4" />
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600, color: C.fairway900 }} className="mb-2">
          {done === "cancel" ? "Booking dibatalkan" : "Booking dijadwal ulang"}
        </h3>
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
          {done === "cancel" ? `Refund ${rupiah(refund)} akan diproses ke metode pembayaran asal dalam 3-5 hari kerja.` : `Slot baru: ${newSlot}. Notifikasi telah dikirim via WhatsApp.`}
        </p>
        <Button onClick={() => { setDone(null); setAction(null); }} variant="ghost">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SectionTitle eyebrow="Booking Aktif" title="Sentul Highlands Golf Club" />
      <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-4">
          <Flag size={22} color={C.flag} />
          <div>
            <div className="font-semibold text-sm">Sab, 18 Jul 2026 &middot; 07:00</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>2 pemain &middot; Caddy: Bambang S. (Andi), Rini A. (Sarah)</div>
          </div>
        </div>
        <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>{rupiah(total)}</div>
      </div>

      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: C.sand }}>
        <div className="text-xs font-medium mb-2" style={{ color: C.fairway900 }}>Simulasi: geser untuk lihat efek waktu pembatalan terhadap biaya</div>
        <input type="range" min={2} max={96} value={hoursLeft} onChange={(e) => setHoursLeft(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-xs mt-1" style={{ color: C.inkSoft }}>
          <span>2 jam lagi</span>
          <span className="font-semibold" style={{ color: C.ink }}>{hoursLeft} jam sebelum tee time</span>
          <span>96 jam lagi</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Biaya cancel</div>
            <div className="font-semibold text-sm">{feePct}%</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Potongan</div>
            <div className="font-semibold text-sm">{rupiah(fee)}</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Refund</div>
            <div className="font-semibold text-sm" style={{ color: C.fairway700 }}>{rupiah(refund)}</div>
          </div>
        </div>
        <div className="text-[11px] mt-3" style={{ color: C.inkSoft }}>Kebijakan: &gt;72 jam gratis &middot; 24–72 jam potong 50% &middot; &lt;24 jam potong 100%</div>
      </div>

      {!action && (
        <div className="flex gap-3">
          <Button onClick={() => setAction("reschedule")} variant="ghost" icon={RotateCcw} className="flex-1">Reschedule</Button>
          <Button onClick={() => setAction("cancel")} className="flex-1">Batalkan booking</Button>
        </div>
      )}

      {action === "cancel" && (
        <Modal onClose={() => setAction(null)}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#FBEAE0" }}>
            <AlertTriangle size={22} color={C.flag} />
          </div>
          <div className="text-lg font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900 }}>Batalkan booking ini?</div>
          <p className="text-sm mb-5" style={{ color: C.inkSoft }}>
            Tee time <strong style={{ color: C.ink }}>Sab, 18 Jul 2026 &middot; 07:00</strong> akan dibatalkan.
            Kamu akan menerima refund sebesar <strong style={{ color: C.fairway700 }}>{rupiah(refund)}</strong> setelah dipotong biaya pembatalan {feePct}% ({rupiah(fee)}).
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setAction(null)} variant="ghost" className="flex-1">Batal</Button>
            <Button onClick={() => setDone("cancel")} className="flex-1">Ya, batalkan booking</Button>
          </div>
        </Modal>
      )}

      {action === "reschedule" && (
        <Modal onClose={() => { setAction(null); setNewSlot(null); }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: C.sand }}>
            <RotateCcw size={20} color={C.fairway700} />
          </div>
          <div className="text-lg font-semibold mb-3" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900 }}>Pilih slot baru</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SLOTS.map((t) => (
              <button key={t} onClick={() => setNewSlot(t)} className="py-2.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: newSlot === t ? C.flag : C.ivory, color: newSlot === t ? C.ivory : C.ink, border: `1px solid ${newSlot === t ? C.flag : C.line}`, fontFamily: "'IBM Plex Mono', monospace" }}>
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs mb-4" style={{ color: C.inkSoft }}>Biaya reschedule {feePct > 0 ? rupiah(fee) + ` (${feePct}%)` : "gratis"} akan ditambahkan ke booking baru.</p>
          <div className="flex gap-3">
            <Button onClick={() => { setAction(null); setNewSlot(null); }} variant="ghost" className="flex-1">Batal</Button>
            <Button onClick={() => setDone("reschedule")} disabled={!newSlot} className="flex-1">Konfirmasi reschedule</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
