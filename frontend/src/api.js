const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request gagal (${res.status})`);
  }
  return data;
}

export const api = {
  getCourses: (search) => request(`/courses${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getCourse: (id) => request(`/courses/${id}`),
  getSlots: (courseId, date) => request(`/courses/${courseId}/slots?date=${date}`),
  getCategories: () => request(`/categories`),
  getMemberships: () => request(`/memberships`),
  getCaddies: () => request(`/caddies`),
  getCaddyAvailability: (date, slot) => request(`/caddies/availability?date=${date}&slot=${slot}`),
  getMenu: () => request(`/menu`),
  createBooking: (payload) => request(`/bookings`, { method: "POST", body: JSON.stringify(payload) }),
  getBooking: (code) => request(`/bookings/${code}`),
  cancelBooking: (code) => request(`/bookings/${code}/cancel`, { method: "POST" }),
  rescheduleBooking: (code, newSlot) =>
    request(`/bookings/${code}/reschedule`, { method: "POST", body: JSON.stringify({ newSlot }) }),
};
