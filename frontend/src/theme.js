export const C = {
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

export const rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

// Format Date -> 'YYYY-MM-DD' (untuk dikirim ke API)
export const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Format Date -> 'Sab, 18 Jul 2026' (untuk ditampilkan)
export const toDisplayDate = (date) => {
  const day = DAY_LABELS[date.getDay()];
  const d = date.getDate();
  const m = MONTH_LABELS[date.getMonth()];
  const y = date.getFullYear();
  return `${day}, ${d} ${m} ${y}`;
};

// Buat array N tanggal ke depan mulai dari besok, masing2 { iso, display }
export const nextDates = (count = 7, startOffset = 1) => {
  const out = [];
  const today = new Date();
  for (let i = startOffset; i < startOffset + count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push({ iso: toISODate(d), display: toDisplayDate(d) });
  }
  return out;
};

export const isWeekendISO = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
};
