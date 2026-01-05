"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("engenharia.artcompany@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Login inválido.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Painel Admin</h1>
          <p className="mt-2 text-sm text-white/70">
            Acesso restrito (Artcompany / ACB Usinagem CNC).
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Senha</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="h-11 w-full rounded-xl bg-yellow-400 font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
              type="submit"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
