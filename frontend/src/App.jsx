import React, { useEffect, useMemo, useState } from "react";
import { Flag, ChevronLeft } from "lucide-react";
import { C, toISODate } from "./theme";
import { Stepper } from "./components/Common";
import { api } from "./api";

import CourseList from "./components/CourseList";
import ScheduleStep, { computePlayerRate } from "./components/ScheduleStep";
import CaddyStep from "./components/CaddyStep";
import FoodStep from "./components/FoodStep";
import PaymentStep from "./components/PaymentStep";
import Confirmation from "./components/Confirmation";
import ManageBooking from "./components/ManageBooking";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
};

const defaultPlayers = () => [
  { id: "p1", name: "", memberCode: "", caddyId: null, categoryId: "pria", membershipId: "umum" },
  { id: "p2", name: "", memberCode: "", caddyId: null, categoryId: "pria", membershipId: "umum" },
];

export default function App() {
  const [tab, setTab] = useState("book"); // book | manage
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(null);
  const [date, setDate] = useState(tomorrow());
  const [slot, setSlot] = useState(null);
  const [playersList, setPlayersList] = useState(defaultPlayers());
  const [cart, setCart] = useState({}); // { [menuItemId]: { qty, price } }
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState(null);

  // reference data dipakai lintas step
  const [categories, setCategories] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [caddies, setCaddies] = useState([]);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getMemberships(), api.getCaddies()])
      .then(([cats, mems, cds]) => {
        setCategories(cats);
        setMemberships(mems);
        setCaddies(cds);
      })
      .catch(() => {});
  }, []);

  const addItem = (id, price, delta) =>
    setCart((c) => {
      const currentQty = c[id]?.qty || 0;
      const nextQty = Math.max(0, currentQty + delta);
      const next = { ...c };
      if (nextQty === 0) delete next[id];
      else next[id] = { qty: nextQty, price };
      return next;
    });

  const cartTotal = useMemo(() => Object.values(cart).reduce((sum, i) => sum + i.qty * i.price, 0), [cart]);
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, i) => sum + i.qty, 0), [cart]);

  const slotTotal = useMemo(
    () =>
      course && categories.length
        ? playersList.reduce((sum, p) => sum + computePlayerRate(course, date, p.categoryId, p.membershipId, categories, memberships), 0)
        : 0,
    [course, date, playersList, categories, memberships]
  );
  const assignedCaddies = playersList.map((p) => caddies.find((c) => c.id === p.caddyId)).filter(Boolean);
  const caddyTotal = assignedCaddies.reduce((sum, c) => sum + Number(c.fee), 0);
  const grandTotal = slotTotal + caddyTotal + cartTotal;

  const goCourseDetail = (c) => {
    setCourse(c);
    setStep(0);
    setSlot(null);
  };
  const canNextFromSchedule = !!slot;

  const resetAll = () => {
    setCourse(null);
    setStep(0);
    setSlot(null);
    setPlayersList(defaultPlayers());
    setCart({});
    setConfirmedBooking(null);
    setPayError(null);
  };

  const handlePay = async (method) => {
    setSubmitting(true);
    setPayError(null);
    try {
      const payload = {
        courseId: course.id,
        date,
        slot,
        players: playersList.map((p) => ({
          name: p.name,
          memberCode: p.memberCode || null,
          categoryId: p.categoryId,
          membershipId: p.membershipId,
          caddyId: p.caddyId,
        })),
        food: Object.entries(cart).map(([menuItemId, v]) => ({ menuItemId, qty: v.qty })),
        paymentMethod: method,
      };
      const booking = await api.createBooking(payload);
      setConfirmedBooking(booking);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100%", color: C.ink, fontFamily: "'Inter', sans-serif" }}>
      {/* Top nav */}
      <div style={{ backgroundColor: C.fairway900 }} className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={20} color={C.sand} />
          <span style={{ fontFamily: "'Fraunces', serif", color: C.ivory, fontWeight: 600, fontSize: "20px" }}>GolfGo</span>
        </div>
        <div className="flex gap-1 rounded-full p-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          {[["book", "Booking"], ["manage", "Booking Saya"]].map(([key, label]) => (
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
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {tab === "book" && !course && <CourseList onSelect={goCourseDetail} />}

        {tab === "book" && course && !confirmedBooking && (
          <>
            <button onClick={() => setCourse(null)} className="flex items-center gap-1 text-sm mb-6" style={{ color: C.inkSoft }}>
              <ChevronLeft size={16} /> Kembali ke daftar course
            </button>
            <Stepper current={step} />
            {step === 0 && (
              <ScheduleStep
                course={course} date={date} setDate={setDate} slot={slot} setSlot={setSlot}
                playersList={playersList} setPlayersList={setPlayersList}
                onNext={() => setStep(1)} canNext={canNextFromSchedule}
                categories={categories} memberships={memberships}
              />
            )}
            {step === 1 && (
              <CaddyStep
                date={date} slot={slot} playersList={playersList} setPlayersList={setPlayersList}
                onNext={() => setStep(2)} onBack={() => setStep(0)} caddies={caddies}
              />
            )}
            {step === 2 && (
              <FoodStep cart={cart} addItem={addItem} cartTotal={cartTotal} cartCount={cartCount} onNext={() => setStep(3)} onBack={() => setStep(1)} />
            )}
            {step === 3 && (
              <PaymentStep
                course={course} date={date} slot={slot} playersList={playersList} cart={cart}
                categories={categories} memberships={memberships} caddies={caddies}
                slotTotal={slotTotal} caddyTotal={caddyTotal} cartTotal={cartTotal} grandTotal={grandTotal}
                onBack={() => setStep(2)} onPay={handlePay} submitting={submitting} error={payError}
              />
            )}
          </>
        )}

        {tab === "book" && course && confirmedBooking && <Confirmation booking={confirmedBooking} onDone={resetAll} />}

        {tab === "manage" && <ManageBooking />}
      </div>
    </div>
  );
}
