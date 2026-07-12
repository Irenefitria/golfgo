import React, { useEffect, useState } from "react";
import { SectionTitle, Button, LoadingBlock, ErrorBlock } from "./Common";
import { C, rupiah } from "../theme";
import { api } from "../api";

export default function CaddyStep({ date, slot, playersList, setPlayersList, onNext, onBack, caddies }) {
  const [takenElsewhere, setTakenElsewhere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getCaddyAvailability(date, slot)
      .then((avail) => setTakenElsewhere(avail.takenCaddyIds || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date, slot]);

  const setCaddyFor = (idx, caddyId) => setPlayersList((list) => list.map((p, i) => (i === idx ? { ...p, caddyId } : p)));
  const takenByPlayer = (caddyId, exceptIdx) => playersList.findIndex((p, i) => i !== exceptIdx && p.caddyId === caddyId);

  if (loading) return <LoadingBlock label="Memuat daftar caddy..." />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <SectionTitle eyebrow="Opsional, per pemain" title="Pilih caddy untuk tiap pemain" />
      <div className="space-y-5 mb-8">
        {playersList.map((p, idx) => (
          <div key={p.id} className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: C.fairway700, color: C.ivory, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {idx + 1}
              </div>
              <span className="text-sm font-semibold" style={{ color: C.fairway900 }}>{p.name || `Pemain ${idx + 1}`}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                onClick={() => setCaddyFor(idx, null)}
                className="text-left px-4 py-2.5 rounded-xl text-xs"
                style={{ backgroundColor: !p.caddyId ? C.sand : C.ivory, border: `1.5px solid ${!p.caddyId ? C.sandDark : C.line}` }}
              >
                Tanpa caddy
              </button>
              {caddies.map((cd) => {
                const takenByOtherPlayer = takenByPlayer(cd.id, idx);
                const bookedElsewhere = takenElsewhere.includes(cd.id);
                const disabled = takenByOtherPlayer !== -1 || bookedElsewhere;
                return (
                  <button
                    key={cd.id}
                    disabled={disabled}
                    onClick={() => setCaddyFor(idx, cd.id)}
                    className="text-left px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: p.caddyId === cd.id ? C.sand : disabled ? "#f2f0ea" : C.ivory,
                      border: `1.5px solid ${p.caddyId === cd.id ? C.sandDark : C.line}`,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>
                      <span className="font-medium">{cd.name}</span>
                      <span style={{ color: C.inkSoft }}> · {cd.experience_yrs}th · ⭐{cd.rating}</span>
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag, whiteSpace: "nowrap" }}>
                      {takenByOtherPlayer !== -1 ? `dipilih P${takenByOtherPlayer + 1}` : bookedElsewhere ? "terpakai" : rupiah(cd.fee)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
        <Button onClick={onNext}>Lanjut pesan makanan</Button>
      </div>
    </div>
  );
}
