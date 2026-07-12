import React, { useEffect, useState } from "react";
import { Trash2, Save, Search } from "lucide-react";
import { C, rupiah } from "../theme";
import { LoadingBlock, ErrorBlock } from "../components/Common";
import { adminApi } from "../adminApi";

const STATUS_OPTIONS = ["pending", "paid", "cancelled", "rescheduled", "completed"];

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState({});
  const [savingCode, setSavingCode] = useState(null);

  const load = async (params) => {
    setLoading(true);
    setError(null);
    try {
      setBookings(await adminApi.getBookings(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (b) =>
    setEditing((e) => ({
      ...e,
      [b.booking_code]: {
        status: b.status,
        booking_date: String(b.booking_date).slice(0, 10),
        time_slot: b.time_slot,
        contact_name: b.contact_name || "",
        contact_phone: b.contact_phone || "",
      },
    }));

  const cancelEdit = (code) =>
    setEditing((e) => {
      const n = { ...e };
      delete n[code];
      return n;
    });

  const setField = (code, field, value) => setEditing((e) => ({ ...e, [code]: { ...e[code], [field]: value } }));

  const save = async (code) => {
    setSavingCode(code);
    setError(null);
    try {
      await adminApi.updateBooking(code, editing[code]);
      cancelEdit(code);
      await load({ search });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCode(null);
    }
  };

  const remove = async (code) => {
    if (!window.confirm(`Hapus booking ${code}? Aksi ini tidak bisa dibatalkan.`)) return;
    setError(null);
    try {
      await adminApi.deleteBooking(code);
      setBookings((rows) => rows.filter((b) => b.booking_code !== code));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontSize: "24px", fontWeight: 600 }}>
          Kelola Pesanan
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); load({ search }); }} className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode / nama / telepon"
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}` }}
          />
          <button type="submit" className="p-2 rounded-lg" style={{ border: `1.5px solid ${C.line}` }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBlock message={error} />
        </div>
      )}

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: C.sand }}>
                {["Kode", "Course", "Tanggal", "Slot", "Kontak", "Status", "Total", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: C.fairway900 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const edit = editing[b.booking_code];
                return (
                  <tr key={b.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">{b.booking_code}</td>
                    <td className="px-4 py-3">{b.course_name}</td>
                    <td className="px-4 py-3">
                      {edit ? (
                        <input
                          type="date"
                          value={edit.booking_date}
                          onChange={(e) => setField(b.booking_code, "booking_date", e.target.value)}
                          className="px-2 py-1 rounded border text-xs"
                          style={{ borderColor: C.line }}
                        />
                      ) : (
                        String(b.booking_date).slice(0, 10)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {edit ? (
                        <input
                          value={edit.time_slot}
                          onChange={(e) => setField(b.booking_code, "time_slot", e.target.value)}
                          className="w-16 px-2 py-1 rounded border text-xs"
                          style={{ borderColor: C.line }}
                        />
                      ) : (
                        b.time_slot
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {edit ? (
                        <div className="flex flex-col gap-1">
                          <input
                            value={edit.contact_name}
                            onChange={(e) => setField(b.booking_code, "contact_name", e.target.value)}
                            placeholder="Nama"
                            className="px-2 py-1 rounded border text-xs"
                            style={{ borderColor: C.line }}
                          />
                          <input
                            value={edit.contact_phone}
                            onChange={(e) => setField(b.booking_code, "contact_phone", e.target.value)}
                            placeholder="Telepon"
                            className="px-2 py-1 rounded border text-xs"
                            style={{ borderColor: C.line }}
                          />
                        </div>
                      ) : (
                        <div>
                          <div>{b.contact_name || "-"}</div>
                          <div style={{ color: C.inkSoft }}>{b.contact_phone || "-"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {edit ? (
                        <select
                          value={edit.status}
                          onChange={(e) => setField(b.booking_code, "status", e.target.value)}
                          className="px-2 py-1 rounded border text-xs"
                          style={{ borderColor: C.line }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: C.sand, color: C.fairway900 }}
                        >
                          {b.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">{rupiah(b.grand_total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {edit ? (
                          <>
                            <button
                              onClick={() => save(b.booking_code)}
                              disabled={savingCode === b.booking_code}
                              className="p-1.5 rounded-lg"
                              style={{ backgroundColor: C.fairway700, color: C.ivory }}
                            >
                              <Save size={14} />
                            </button>
                            <button onClick={() => cancelEdit(b.booking_code)} className="text-xs" style={{ color: C.inkSoft }}>
                              Batal
                            </button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(b)} className="text-xs font-medium" style={{ color: C.fairway700 }}>
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => remove(b.booking_code)}
                          className="p-1.5 rounded-lg"
                          style={{ border: `1px solid ${C.line}`, color: C.flagDark }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!bookings.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center" style={{ color: C.inkSoft }}>
                    Belum ada booking
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
