import React from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { TicketCard, Button } from "./Common";
import { C, rupiah } from "../theme";

export default function Confirmation({ booking, onDone }) {
  return (
    <div className="max-w-lg mx-auto text-center py-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: C.fairway700 }}>
        <CheckCircle2 size={30} color={C.ivory} />
      </div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 600, color: C.fairway900 }} className="mb-2">
        Booking terkonfirmasi
      </h2>
      <p className="text-sm mb-8" style={{ color: C.inkSoft }}>
        E-ticket telah dibuat. Tunjukkan kode booking ini saat check-in di club house.
      </p>
      <TicketCard
        footer={
          <div className="text-xs text-center" style={{ color: C.inkSoft }}>
            Kode booking <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.ink, fontWeight: 600 }}>{booking.booking_code}</span>
          </div>
        }
      >
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.fairway900 }}>
            <QrCode size={64} color={C.ivory} />
          </div>
        </div>
        <div className="text-sm font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900 }}>{booking.course_name}</div>
        <div className="text-xs mt-1 mb-3" style={{ color: C.inkSoft }}>
          {booking.booking_date} &middot; {booking.time_slot} &middot; {booking.players.length} pemain
        </div>
        <div className="space-y-1 text-left max-w-[240px] mx-auto">
          {booking.players.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <span>{i + 1}. {p.name || `Pemain ${i + 1}`}</span>
              <span style={{ color: p.caddy_name ? C.fairway700 : C.inkSoft }}>{p.caddy_name || "—"}</span>
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-3" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(booking.grand_total)}</div>
      </TicketCard>
      <div className="mt-8">
        <Button onClick={onDone} variant="dark">Buat booking baru</Button>
      </div>
    </div>
  );
}
