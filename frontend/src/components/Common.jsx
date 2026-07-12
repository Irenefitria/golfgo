import React from "react";
import { C } from "../theme";

const STEPS = ["Jadwal", "Caddy", "Makanan", "Pembayaran"];

export function Stepper({ current }) {
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

export function Button({ children, onClick, variant = "primary", disabled, className = "", icon: Icon, type = "button" }) {
  const styles = {
    primary: { backgroundColor: disabled ? C.sandDark : C.flag, color: C.ivory },
    ghost: { backgroundColor: "transparent", color: C.fairway900, border: `1.5px solid ${C.line}` },
    dark: { backgroundColor: C.fairway900, color: C.ivory },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={`px-5 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${disabled ? "cursor-not-allowed" : "hover:opacity-90"} ${className}`}
      style={{ ...styles[variant], fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

export function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <div className="text-xs tracking-[0.18em] uppercase mb-1" style={{ color: C.flag, fontFamily: "'IBM Plex Mono', monospace" }}>{eyebrow}</div>
      <h2 style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontSize: "28px", fontWeight: 600 }}>{title}</h2>
    </div>
  );
}

export function TicketCard({ children, footer }) {
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

export function Row({ label, raw }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{raw}</span>
    </div>
  );
}

export function Modal({ onClose, children }) {
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
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function LoadingBlock({ label = "Memuat..." }) {
  return (
    <div className="flex items-center justify-center py-20 text-sm" style={{ color: C.inkSoft }}>
      {label}
    </div>
  );
}

export function ErrorBlock({ message }) {
  return (
    <div className="rounded-xl p-4 text-sm text-center" style={{ backgroundColor: "#FBEAE0", color: C.flagDark }}>
      {message}
    </div>
  );
}
