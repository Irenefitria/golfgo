import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { C } from "../theme";
import { api } from "../api";

// Kalau pemain non-member: input nama bebas seperti biasa.
// Kalau tipe membership dipilih (Member Klub / GolfGo Member): input diganti jadi
// ID Member, di-lookup ke server (debounced) dan preview nama pemiliknya ditampilkan.
// Nama & tipe membership final tetap divalidasi ulang di server saat submit booking.
export default function PlayerIdentityField({ player, isMember, onChange, placeholder }) {
  const [status, setStatus] = useState("idle"); // idle | loading | found | notfound
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isMember) return undefined;
    const code = (player.memberCode || "").trim();
    if (!code) {
      setStatus("idle");
      onChange({ memberVerified: false, membershipLabel: "" });
      return undefined;
    }
    setStatus("loading");
    onChange({ memberVerified: false, membershipLabel: "" });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.lookupMember(code);
        setStatus("found");
        onChange({ name: res.name, membershipId: res.membershipId, membershipLabel: res.membershipLabel, memberVerified: true });
      } catch (err) {
        setStatus("notfound");
        onChange({ name: "", memberVerified: false, membershipLabel: "" });
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.memberCode, isMember]);

  if (!isMember) {
    return (
      <input
        value={player.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder={placeholder}
        className="flex-1 text-sm rounded-lg px-3 py-2.5 outline-none"
        style={{ border: `1px solid ${C.line}`, backgroundColor: "#fff" }}
      />
    );
  }

  return (
    <div className="flex-1">
      <input
        value={player.memberCode || ""}
        onChange={(e) => onChange({ memberCode: e.target.value })}
        placeholder="ID Member (mis. MBR-12345)"
        className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
        style={{ border: `1px solid ${status === "notfound" ? C.flag : C.line}`, backgroundColor: "#fff" }}
      />
      {status === "loading" && (
        <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.inkSoft }}>
          <Loader2 size={12} className="animate-spin" /> Mencari member...
        </div>
      )}
      {status === "found" && (
        <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.fairway700 }}>
          <CheckCircle2 size={12} /> {player.name}
        </div>
      )}
      {status === "notfound" && (
        <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.flag }}>
          <XCircle size={12} /> ID Member tidak ditemukan
        </div>
      )}
    </div>
  );
}
