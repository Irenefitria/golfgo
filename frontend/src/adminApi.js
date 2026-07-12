const BASE = "/api";
const TOKEN_KEY = "golfgo_admin_token";

export const adminAuth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, options = {}) {
  const token = adminAuth.getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) adminAuth.clear();
  if (!res.ok) throw new Error(data.error || `Request gagal (${res.status})`);
  return data;
}

export const adminApi = {
  login: (username, password) => request(`/auth/login`, { method: "POST", body: JSON.stringify({ username, password }) }),

  getBookings: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/admin/bookings${qs ? `?${qs}` : ""}`);
  },
  updateBooking: (code, patch) => request(`/admin/bookings/${code}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteBooking: (code) => request(`/admin/bookings/${code}`, { method: "DELETE" }),

  getMembers: () => request(`/admin/members`),
  addMember: (payload) => request(`/admin/members`, { method: "POST", body: JSON.stringify(payload) }),
  deleteMember: (id) => request(`/admin/members/${id}`, { method: "DELETE" }),

  getMemberships: () => request(`/memberships`),
};
