import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Plus, Minus, ChevronRight } from "lucide-react";
import { C, rupiah, nextDates, isWeekendISO } from "../theme";
import { Button, LoadingBlock, ErrorBlock } from "./Common";
import { api } from "../api";

const DATES = nextDates(6);

export function computePlayerRate(course, iso, categoryId, membershipId, categories, memberships) {
  const cat = categories.find((c) => c.id === categoryId) || categories[0];
  const mem = memberships.find((m) => m.id === membershipId) || memberships[0];
  if (!course || !cat || !mem) return 0;
  const base = isWeekendISO(iso) ? Number(course.rate_weekend) : Number(course.rate_weekday);
  return Math.round(base * Number(cat.multiplier) * (1 - Number(mem.discount)));
}

export default function ScheduleStep({ course, date, setDate, slot, setSlot, playersList, setPlayersList, onNext, canNext, categories, memberships }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekend = isWeekendISO(date);

  useEffect(() => {
    if (!course) return;
    setLoading(true);
    api
      .getSlots(course.id, date)
      .then(setSlots)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    setSlot(null);
  }, [course, date]);

  const addPlayer = () =>
    setPlayersList((list) =>
      list.length >= 4 ? list : [...list, { id: `p${list.length + 1}-${Date.now()}`, name: "", caddyId: null, categoryId: "pria", membershipId: "umum" }]
    );
  const removePlayer = () => setPlayersList((list) => (list.length <= 1 ? list : list.slice(0, -1)));
  const updatePlayer = (idx, patch) => setPlayersList((list) => list.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  if (loading) return <LoadingBlock label="Memuat data jadwal..." />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <div className="mb-1 text-xs tracking-[0.18em] uppercase" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>
        {course.name}
      </div>
      <h2 className="mb-5" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontSize: "28px", fontWeight: 600 }}>
        Pilih tanggal & jam tee time
      </h2>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {DATES.map((d) => (
          <button
            key={d.iso}
            onClick={() => setDate(d.iso)}
            className="px-4 py-2 rounded-full text-sm whitespace-nowrap"
            style={{
              backgroundColor: date === d.iso ? C.fairway700 : "#fff",
              color: date === d.iso ? C.ivory : C.ink,
              border: `1px solid ${date === d.iso ? C.fairway700 : C.line}`,
            }}
          >
            <Calendar size={13} className="inline mr-1.5 -mt-0.5" />
            {d.display}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {slots.map((s) => (
          <button
            key={s.time}
            disabled={!s.available}
            onClick={() => setSlot(s.time)}
            className="py-3 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: slot === s.time ? C.flag : s.available ? "#fff" : "#f2f0ea",
              color: slot === s.time ? C.ivory : s.available ? C.ink : C.inkSoft,
              border: `1px solid ${slot === s.time ? C.flag : C.line}`,
              fontFamily: "'IBM Plex Mono', monospace",
              opacity: s.available ? 1 : 0.5,
              cursor: s.available ? "pointer" : "not-allowed",
              textDecoration: s.available ? "none" : "line-through",
            }}
          >
            {s.time}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: C.sand }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.fairway900, fontFamily: "'IBM Plex Mono', monospace" }}>
            Rate {weekend ? "akhir pekan" : "hari kerja"}
          </span>
          <span className="text-xs" style={{ color: C.inkSoft }}>{weekend ? "Sab–Min" : "Sen–Jum"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg p-3 text-center" style={{ backgroundColor: "#fff" }}>
              <div className="text-xs mb-1" style={{ color: C.inkSoft }}>{cat.short_label}</div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.fairway900 }}>
                {rupiah(Math.round((weekend ? Number(course.rate_weekend) : Number(course.rate_weekday)) * Number(cat.multiplier)))}
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
          <div className="flex items-center gap-2">
            <Users size={18} color={C.inkSoft} />
            <span className="text-sm font-medium">Data pemain (maks. 4)</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={removePlayer} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}>
              <Minus size={14} />
            </button>
            <span className="w-4 text-center font-semibold">{playersList.length}</span>
            <button onClick={addPlayer} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}>
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {playersList.map((p, idx) => (
            <div key={p.id} className="rounded-xl p-3" style={{ backgroundColor: C.ivory }}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: C.sand, color: C.fairway900, fontFamily: "'IBM Plex Mono', monospace" }}
                >
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
                  value={p.categoryId}
                  onChange={(e) => updatePlayer(idx, { categoryId: e.target.value })}
                  className="text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff", color: C.ink }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <select
                  value={p.membershipId}
                  onChange={(e) => updatePlayer(idx, { membershipId: e.target.value })}
                  className="text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff", color: C.ink }}
                >
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="text-right text-xs font-semibold mt-2 pr-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>
                {rupiah(computePlayerRate(course, date, p.categoryId, p.membershipId, categories, memberships))}
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
