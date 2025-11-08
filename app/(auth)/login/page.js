"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Demo-only credential check. Replace with real auth later.
    const ok = username.trim().toLowerCase() === "admin" && password === "admin123";
    if (!ok) {
      setError("Invalid admin credentials. Try admin / admin123");
      return;
    }

    try {
      localStorage.setItem("isAdmin", "true");
    } catch {}

    router.push("/dashboard");
  };

  return (
    <section className="mt-20 px-4 sm:px-9 max-w-md mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={onSubmit} className="glass p-6 rounded-xl border border-primary/20 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">Username</label>
          <input
            className="w-full rounded-md bg-dark-100/40 border border-primary/30 px-3 py-2 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded-md bg-dark-100/40 border border-primary/30 px-3 py-2 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" className="px-4 py-2 bg-primary text-dark-100 rounded-md font-medium">
          Login
        </button>
      </form>
    </section>
  );
}
