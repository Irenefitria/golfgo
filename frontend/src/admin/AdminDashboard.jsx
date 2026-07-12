import React, { useState } from "react";
import { Flag, LogOut } from "lucide-react";
import { C } from "../theme";
import BookingsTab from "./BookingsTab";
import MembersTab from "./MembersTab";

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("bookings");

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100vh", color: C.ink, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ backgroundColor: C.fairway900 }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Flag size={20} color={C.sand} />
          <span style={{ fontFamily: "'Fraunces', serif", color: C.ivory, fontWeight: 600, fontSize: "20px" }}>
            GolfGo Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 rounded-full p-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            {[
              ["bookings", "Pesanan"],
              ["members", "Member"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: tab === key ? C.ivory : "transparent", color: tab === key ? C.fairway900 : C.sand }}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={onLogout} className="flex items-center gap-1 text-sm" style={{ color: C.sand }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {tab === "bookings" && <BookingsTab />}
        {tab === "members" && <MembersTab />}
      </div>
    </div>
  );
}
