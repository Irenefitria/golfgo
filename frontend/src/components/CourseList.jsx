import React, { useEffect, useState } from "react";
import { MapPin, Star, Flag, Search } from "lucide-react";
import { C, rupiah } from "../theme";
import { SectionTitle, LoadingBlock, ErrorBlock } from "./Common";
import { api } from "../api";

export default function CourseList({ onSelect }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .getCourses(search)
        .then((data) => active && setCourses(data))
        .catch((err) => active && setError(err.message))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [search]);

  return (
    <div>
      <SectionTitle eyebrow="Cari & Pesan" title="Mau main golf di mana hari ini?" />
      <div className="flex items-center gap-3 rounded-full px-5 py-3 mb-8" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
        <Search size={18} color={C.inkSoft} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama course atau kota..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: C.ink }}
        />
      </div>

      {loading && <LoadingBlock label="Memuat daftar course..." />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 gap-5">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="text-left rounded-2xl overflow-hidden group transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}
            >
              <div className="h-32 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${c.tone}, ${C.fairway900})` }}>
                <Flag size={22} color={C.ivory} style={{ opacity: 0.85 }} />
              </div>
              <div className="p-5">
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", fontWeight: 600, color: C.fairway900 }}>{c.name}</h3>
                <div className="flex items-center gap-1 text-xs mt-1" style={{ color: C.inkSoft }}>
                  <MapPin size={13} /> {c.location}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} fill={C.flag} color={C.flag} />
                    <span style={{ fontWeight: 600 }}>{c.rating}</span>
                    <span style={{ color: C.inkSoft }}>({c.reviews})</span>
                  </div>
                  <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.flag }}>
                    mulai {rupiah(c.rate_weekday)}
                    <span className="text-xs" style={{ color: C.inkSoft }}>/hari kerja</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {!courses.length && <div className="col-span-2 text-sm text-center py-10" style={{ color: C.inkSoft }}>Tidak ada course ditemukan.</div>}
        </div>
      )}
    </div>
  );
}
