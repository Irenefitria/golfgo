// Tanggal disimpan sebagai ISO 'YYYY-MM-DD'. Sabtu=6, Minggu=0 (getUTCDay)
function isWeekendDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00Z");
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

function computePlayerRate(course, isoDate, category, membership) {
  const base = isWeekendDate(isoDate) ? Number(course.rate_weekend) : Number(course.rate_weekday);
  return Math.round(base * Number(category.multiplier) * (1 - Number(membership.discount)));
}

function generateBookingCode() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `GG-${n}`;
}

function generateMemberCode() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `MBR-${n}`;
}

// Kebijakan pembatalan/reschedule: >72 jam gratis, 24-72 jam 50%, <24 jam 100%
function cancellationFeePct(hoursLeft) {
  if (hoursLeft >= 72) return 0;
  if (hoursLeft >= 24) return 50;
  return 100;
}

function hoursUntilTeeTime(bookingDate, timeSlot) {
  const teeTime = new Date(`${bookingDate}T${timeSlot}:00Z`);
  const diffMs = teeTime.getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}

module.exports = {
  isWeekendDate,
  computePlayerRate,
  generateBookingCode,
  generateMemberCode,
  cancellationFeePct,
  hoursUntilTeeTime,
};
