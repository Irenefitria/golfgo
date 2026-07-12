import React, { useEffect, useState } from "react";
import { UtensilsCrossed, Minus, Plus, ChevronRight } from "lucide-react";
import { SectionTitle, Button, LoadingBlock, ErrorBlock } from "./Common";
import { C, rupiah } from "../theme";
import { api } from "../api";

export default function FoodStep({ cart, addItem, cartTotal, cartCount, onNext, onBack }) {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMenu()
      .then(setMenu)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Memuat menu restoran..." />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <SectionTitle eyebrow="Club House Restaurant" title="Pesan makanan sekalian? (opsional)" />
      <div className="space-y-8 mb-6">
        {Object.entries(menu).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: C.fairway900 }}>
              <UtensilsCrossed size={15} /> {cat}
            </h3>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}>
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs" style={{ color: C.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(it.price)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => addItem(it.id, it.price, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: `1px solid ${C.line}` }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm">{cart[it.id]?.qty || 0}</span>
                    <button
                      onClick={() => addItem(it.id, it.price, 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: C.fairway700, color: C.ivory }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {cartCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl mb-6" style={{ backgroundColor: C.sand }}>
          <span className="text-sm font-medium">{cartCount} item dipilih</span>
          <span className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{rupiah(cartTotal)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">Kembali</Button>
        <Button onClick={onNext} icon={ChevronRight}>{cartCount > 0 ? "Lanjut ke pembayaran" : "Lewati, ke pembayaran"}</Button>
      </div>
    </div>
  );
}
