import React, { useState } from "react";
import { Flag, Lock, Eye, EyeOff } from "lucide-react";
import { C } from "../theme";
import { Button, ErrorBlock } from "../components/Common";
import { adminApi, adminAuth } from "../adminApi";

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await adminApi.login(username, password);
      adminAuth.setToken(token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: C.ivory, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}
      className="flex items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ backgroundColor: "#fff", border: `1px solid ${C.line}` }}
      >
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Flag size={22} color={C.flag} />
          <span style={{ fontFamily: "'Fraunces', serif", color: C.fairway900, fontWeight: 600, fontSize: "22px" }}>
            GolfGo Admin
          </span>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorBlock message={error} />
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          className="w-full mb-4 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: `1.5px solid ${C.line}` }}
        />

        <label className="block text-xs mb-1" style={{ color: C.inkSoft }}>
          Password
        </label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}` }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-0 top-0 h-full w-11 flex items-center justify-center"
            style={{ color: C.inkSoft }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button type="submit" variant="dark" disabled={loading} className="w-full" icon={Lock}>
          {loading ? "Masuk..." : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
