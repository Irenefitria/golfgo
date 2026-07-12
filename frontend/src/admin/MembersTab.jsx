import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { C } from "../theme";
import { LoadingBlock, ErrorBlock, Button } from "../components/Common";
import { adminApi } from "../adminApi";

const emptyForm = { name: "", email: "", phone: "", membershipId: "" };

export default function MembersTab() {
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mem, memTypes] = await Promise.all([adminApi.getMembers(), adminApi.getMemberships()]);
      setMembers(mem);
      setMemberships(memTypes);
      setForm((f) => ({ ...f, membershipId: f.membershipId || memTypes[0]?.id || "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMember = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminApi.addMember(form);
      setForm({ ...emptyForm, membershipId: memberships[0]?.id || "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Hapus member "${name}"?`)) return;
    setError(null);
    try {
      await adminApi.deleteMember(id);
      setMembers((rows) => rows.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-6" style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontSize: "24px", fontWeight: 600 }}>
        Kelola Member
      </h2>

      <form
        onSubmit={addMember}
        className="flex flex-wrap items-end gap-3 mb-8 p-4 rounded-xl"
        style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff" }}
      >
        <div>
          <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
            Nama
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: `1.5px solid ${C.line}` }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: `1.5px solid ${C.line}` }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
            Telepon
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: `1.5px solid ${C.line}` }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
            Tipe Membership
          </label>
          <select
            value={form.membershipId}
            onChange={(e) => setForm((f) => ({ ...f, membershipId: e.target.value }))}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: `1.5px solid ${C.line}` }}
          >
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="dark" disabled={submitting} icon={Plus}>
          Tambah Member
        </Button>
      </form>

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
                {["ID Member", "Nama", "Email", "Telepon", "Membership", "Bergabung", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: C.fairway900 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: C.fairway700 }}>{m.member_code}</td>
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.email || "-"}</td>
                  <td className="px-4 py-3">{m.phone || "-"}</td>
                  <td className="px-4 py-3">{m.membership_label || "-"}</td>
                  <td className="px-4 py-3">{String(m.joined_at).slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove(m.id, m.name)}
                      className="p-1.5 rounded-lg"
                      style={{ border: `1px solid ${C.line}`, color: C.flagDark }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!members.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center" style={{ color: C.inkSoft }}>
                    Belum ada member
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
