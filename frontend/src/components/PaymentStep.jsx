import React, { useState } from "react";
import { Flag, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { SectionTitle, TicketCard, Row, Button, ErrorBlock } from "./Common";
import { C, rupiah } from "../theme";
import { computePlayerRate } from "./ScheduleStep";

const METHODS = [
  { id: "qris", label: "QRIS" },
  { id: "va", label: "Virtual Account" },
  { id: "ewallet", label: "GoPay / OVO / Dana" },
  { id: "cc", label: "Kartu Kredit" },
];

export default function PaymentStep({
  course, date, slot, playersList, cart, categories, memberships, caddies,
  slotTotal, caddyTotal, cartTotal, grandTotal, onBack, onPay, submitting, error,
}) {
  const [method, setMethod] = useState("qris");
  const caddyOf = (id) => caddies.find((c) => c.id === id);
  const catOf = (id) => categories.find((c) => c.id === id) || categories[0];
  const memOf = (id) => memberships.find((m) => m.id === id) || memberships[0];

  return (
    <div>
      <SectionTitle eyebrow="Ringkasan" title="Konfirmasi & bayar" />
      <div className="grid md:grid-cols-2 gap-6">
        <TicketCard
          footer={
            <div className="space-y-2">
              {playersList.map((p, i) => {
                const cat = catOf(p.categoryId);
                const mem = memOf(p.membershipId);
                const label = `${p.name || "Pemain " + (i + 1)} (${cat.short_label}${mem.id !== "umum" ? ", " + mem.label : ""})`;
                return <Row key={p.id} raw={rupiah(computePlayerRate(course, date, p.categoryId, p.membershipId, categories, memberships))} label={label} />;
              })}
              {playersList.filter((p) => p.caddyId).map((p, i) => {
                const cd = caddyOf(p.caddyId);
                if (!cd) return null;
                return <Row key={p.id} raw={rupiah(cd.fee)} label={`Caddy ${p.name || "Pemain " + (i + 1)} — ${cd.name}`} />;
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
              const cd = caddyOf(p.caddyId);
              const cat = catOf(p.categoryId);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {p.name || `Pemain ${i + 1}`} <span style={{ color: C.inkSoft, fontSize: "11px" }}>({cat.short_label})</span></span>
                  <span style={{ color: cd ? C.fairway700 : C.inkSoft, fontSize: "12px" }}>{cd ? cd.name : "tanpa caddy"}</span>
                </div>
              );
            })}
          </div>
        </TicketCard>

        <div>
          <div className="text-sm font-semibold mb-3">Metode pembayaran</div>
          <div className="space-y-2 mb-8">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl text-sm"
                style={{ backgroundColor: method === m.id ? C.sand : "#fff", border: `1.5px solid ${method === m.id ? C.sandDark : C.line}` }}
              >
                <span className="flex items-center gap-2"><CreditCard size={15} />{m.label}</span>
                {method === m.id && <CheckCircle2 size={16} color={C.fairway700} />}
              </button>
            ))}
          </div>
          <div className="rounded-xl p-4 mb-6 flex gap-2 text-xs" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}`, color: C.inkSoft }}>
            <AlertTriangle size={26} color={C.flag} className="flex-shrink-0" />
            Pembatalan &lt;24 jam sebelum tee time dikenakan biaya 100%. Lihat kebijakan lengkap di tab "Booking Saya" setelah konfirmasi.
          </div>
          {error && <div className="mb-4"><ErrorBlock message={error} /></div>}
          <Button onClick={() => onPay(method)} disabled={submitting} className="w-full">
            {submitting ? "Memproses..." : `Bayar ${rupiah(grandTotal)}`}
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
      </div>
    </div>
  );
}
