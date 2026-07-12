import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { C, toISODate, toDisplayDate, DAY_LABELS, MONTH_LABELS } from "../theme";

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

// Trigger + popover kalender bulan penuh, dipakai sebagai "chip" tambahan
// di samping pilihan tanggal cepat (quickDates) supaya user tidak dibatasi
// hanya beberapa hari ke depan.
export default function DatePicker({ value, onChange, quickDates = [], minOffsetDays = 1 }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value ? new Date(`${value}T00:00:00`) : new Date()));
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minOffsetDays);
  const minMonth = startOfMonth(minDate);

  const isCustomSelected = !!value && !quickDates.includes(value);
  const canGoPrev = viewMonth.getTime() > minMonth.getTime();

  const firstWeekday = startOfMonth(viewMonth).getDay();
  const total = daysInMonth(viewMonth);
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const selectDay = (day) => {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    if (d < minDate) return;
    onChange(toISODate(d));
    setOpen(false);
  };

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-1.5"
        style={{
          backgroundColor: isCustomSelected ? C.fairway700 : "#fff",
          color: isCustomSelected ? C.ivory : C.ink,
          border: `1px solid ${isCustomSelected ? C.fairway700 : C.line}`,
        }}
      >
        <Calendar size={13} />
        {isCustomSelected ? toDisplayDate(new Date(`${value}T00:00:00`)) : "Tanggal lain"}
      </button>

      {open && (
        <div
          className="absolute z-20 mt-2 rounded-2xl p-4 shadow-lg"
          style={{ backgroundColor: "#fff", border: `1px solid ${C.line}`, width: 280 }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => canGoPrev && setViewMonth((m) => addMonths(m, -1))}
              disabled={!canGoPrev}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${C.line}`, opacity: canGoPrev ? 1 : 0.3, cursor: canGoPrev ? "pointer" : "not-allowed" }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontWeight: 600, fontSize: "14px" }}>
              {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${C.line}` }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: C.inkSoft }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} />;
              const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
              const iso = toISODate(d);
              const disabled = d < minDate;
              const selected = iso === value;
              const isToday = d.getTime() === today.getTime();
              return (
                <button
                  type="button"
                  key={iso}
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className="text-xs rounded-lg py-1.5"
                  style={{
                    backgroundColor: selected ? C.fairway700 : "transparent",
                    color: disabled ? C.line : selected ? C.ivory : C.ink,
                    border: isToday && !selected ? `1px solid ${C.flag}` : "1px solid transparent",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
