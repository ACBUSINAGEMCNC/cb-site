import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10" type="submit">
              Sair
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/pecas"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Peças</div>
            <div className="mt-2 text-sm text-white/70">
              Cadastrar, editar e organizar o catálogo.
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Ver site</div>
            <div className="mt-2 text-sm text-white/70">
              Abrir a vitrine pública.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
