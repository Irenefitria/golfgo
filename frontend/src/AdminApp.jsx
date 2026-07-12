import React, { useState } from "react";
import { adminAuth } from "./adminApi";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(!!adminAuth.getToken());

  if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  return (
    <AdminDashboard
      onLogout={() => {
        adminAuth.clear();
        setLoggedIn(false);
      }}
    />
  );
}
