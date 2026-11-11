"use client";

import Image from "next/image";
import Link from "next/link";
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

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Email ou senha inválidos.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(245,184,0,0.08),transparent_68%)]"
      />
      <section className="relative w-full max-w-md border border-line bg-surface p-6 shadow-2xl shadow-black/40 sm:p-8">
        <div className="hazard-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
        <div className="flex items-center gap-4">
          <Image
            src="/logo-acb.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Acesso restrito
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase text-fg">
              Painel ACB
            </h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">
          Entre para gerenciar peças, fotos e categorias do catálogo.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="admin-email" className="text-xs font-medium text-steel">
              Email
            </label>
            <input
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 min-h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-xs font-medium text-steel">
              Senha
            </label>
            <input
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 min-h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p role="alert" className="border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="min-h-11 w-full bg-accent px-4 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-60"
            type="submit"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <Link
          href="/"
          className="mt-6 inline-flex text-xs text-muted underline decoration-line underline-offset-4 hover:text-accent"
        >
          Voltar ao site
        </Link>
      </section>
    </main>
  );
}
