import React, { useMemo, useState } from "react";
import { Flag, AlertTriangle, RotateCcw, CheckCircle2, Search } from "lucide-react";
import { SectionTitle, Button, Modal, LoadingBlock, ErrorBlock } from "./Common";
import { C, rupiah } from "../theme";
import { api } from "../api";

function cancellationFeePct(hoursLeft) {
  if (hoursLeft >= 72) return 0;
  if (hoursLeft >= 24) return 50;
  return 100;
}

function realHoursLeft(booking) {
  if (!booking) return 0;
  const tee = new Date(`${booking.booking_date}T${booking.time_slot}:00`);
  return (tee.getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function ManageBooking() {
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simHours, setSimHours] = useState(48);
  const [action, setAction] = useState(null);
  const [newSlot, setNewSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [done, setDone] = useState(null);
  const [doneMeta, setDoneMeta] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const lookup = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    setDone(null);
    try {
      const data = await api.getBooking(code.trim().toUpperCase());
      setBooking(data);
      setSimHours(Math.max(2, Math.min(96, Math.round(realHoursLeft(data)))));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const simFeePct = cancellationFeePct(simHours);
  const simFee = booking ? Math.round((Number(booking.grand_total) * simFeePct) / 100) : 0;
  const simRefund = booking ? Number(booking.grand_total) - simFee : 0;

  const actualHoursLeft = useMemo(() => (booking ? realHoursLeft(booking) : 0), [booking]);
  const actualFeePct = cancellationFeePct(actualHoursLeft);
  const actualFee = booking ? Math.round((Number(booking.grand_total) * actualFeePct) / 100) : 0;
  const actualRefund = booking ? Number(booking.grand_total) - actualFee : 0;

  const openReschedule = async () => {
    setAction("reschedule");
    setNewSlot(null);
    try {
      const slots = await api.getSlots(booking.course_id, booking.booking_date);
      setAvailableSlots(slots.filter((s) => s.available || s.time === booking.time_slot));
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmCancel = async () => {
    setSubmitting(true);
    try {
      const res = await api.cancelBooking(booking.booking_code);
      setDone("cancel");
      setDoneMeta(res);
      setAction(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReschedule = async () => {
    if (!newSlot) return;
    setSubmitting(true);
    try {
      const res = await api.rescheduleBooking(booking.booking_code, newSlot);
      setDone("reschedule");
      setDoneMeta(res);
      setAction(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto">
        <SectionTitle eyebrow="Booking Saya" title="Cek status booking kamu" />
        <form onSubmit={lookup} className="flex items-center gap-3 rounded-full px-5 py-3 mb-4" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
          <Search size={18} color={C.inkSoft} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Masukkan kode booking, mis. GG-28417"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.ink, fontFamily: "'IBM Plex Mono', monospace" }}
          />
        </form>
        <Button onClick={lookup} className="w-full mb-4">Cari booking</Button>
        {loading && <LoadingBlock label="Mencari booking..." />}
        {error && <ErrorBlock message={error} />}
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <CheckCircle2 size={40} color={C.fairway700} className="mx-auto mb-4" />
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600, color: C.fairway900 }} className="mb-2">
          {done === "cancel" ? "Booking dibatalkan" : "Booking dijadwal ulang"}
        </h3>
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
          {done === "cancel"
            ? `Refund ${rupiah(doneMeta?.refund)} akan diproses ke metode pembayaran asal dalam 3-5 hari kerja.`
            : `Slot baru: ${doneMeta?.newSlot}. Notifikasi telah dikirim.`}
        </p>
        <Button onClick={() => { setBooking(null); setAction(null); setCode(""); }} variant="ghost">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SectionTitle eyebrow="Booking Aktif" title={booking.course_name} />
      <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-4">
          <Flag size={22} color={C.flag} />
          <div>
            <div className="font-semibold text-sm">{booking.booking_date} &middot; {booking.time_slot}</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              {booking.players.length} pemain &middot; Caddy: {booking.players.filter((p) => p.caddy_name).map((p) => `${p.caddy_name}${p.name ? ` (${p.name})` : ""}`).join(", ") || "tanpa caddy"}
            </div>
          </div>
        </div>
        <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>{rupiah(booking.grand_total)}</div>
      </div>

      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: C.sand }}>
        <div className="text-xs font-medium mb-2" style={{ color: C.fairway900 }}>Simulasi: geser untuk lihat efek waktu pembatalan terhadap biaya</div>
        <input type="range" min={2} max={96} value={simHours} onChange={(e) => setSimHours(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-xs mt-1" style={{ color: C.inkSoft }}>
          <span>2 jam lagi</span>
          <span className="font-semibold" style={{ color: C.ink }}>{simHours} jam sebelum tee time</span>
          <span>96 jam lagi</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Biaya cancel</div>
            <div className="font-semibold text-sm">{simFeePct}%</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Potongan</div>
            <div className="font-semibold text-sm">{rupiah(simFee)}</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: "#fff" }}>
            <div className="text-xs" style={{ color: C.inkSoft }}>Refund</div>
            <div className="font-semibold text-sm" style={{ color: C.fairway700 }}>{rupiah(simRefund)}</div>
          </div>
        </div>
        <div className="text-[11px] mt-3" style={{ color: C.inkSoft }}>Kebijakan: &gt;72 jam gratis &middot; 24–72 jam potong 50% &middot; &lt;24 jam potong 100%</div>
      </div>

      {error && <div className="mb-4"><ErrorBlock message={error} /></div>}

      {!action && (
        <div className="flex gap-3">
          <Button onClick={openReschedule} variant="ghost" icon={RotateCcw} className="flex-1">Reschedule</Button>
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
            Tee time <strong style={{ color: C.ink }}>{booking.booking_date} &middot; {booking.time_slot}</strong> akan dibatalkan.
            Kamu akan menerima refund sebesar <strong style={{ color: C.fairway700 }}>{rupiah(actualRefund)}</strong> setelah dipotong biaya pembatalan {actualFeePct}% ({rupiah(actualFee)}).
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setAction(null)} variant="ghost" className="flex-1">Batal</Button>
            <Button onClick={confirmCancel} disabled={submitting} className="flex-1">{submitting ? "Memproses..." : "Ya, batalkan booking"}</Button>
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
            {availableSlots.map((s) => (
              <button
                key={s.time}
                disabled={!s.available && s.time !== booking.time_slot}
                onClick={() => setNewSlot(s.time)}
                className="py-2.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: newSlot === s.time ? C.flag : C.ivory,
                  color: newSlot === s.time ? C.ivory : C.ink,
                  border: `1px solid ${newSlot === s.time ? C.flag : C.line}`,
                  fontFamily: "'IBM Plex Mono', monospace",
                  opacity: !s.available && s.time !== booking.time_slot ? 0.4 : 1,
                }}
              >
                {s.time}
              </button>
            ))}
          </div>
          <p className="text-xs mb-4" style={{ color: C.inkSoft }}>
            Biaya reschedule {actualFeePct > 0 ? rupiah(actualFee) + ` (${actualFeePct}%)` : "gratis"} mengikuti kebijakan waktu pembatalan.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => { setAction(null); setNewSlot(null); }} variant="ghost" className="flex-1">Batal</Button>
            <Button onClick={confirmReschedule} disabled={!newSlot || submitting} className="flex-1">{submitting ? "Memproses..." : "Konfirmasi reschedule"}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
