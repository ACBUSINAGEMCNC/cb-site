import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pecas", label: "Peças" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/importar", label: "Importar catálogo" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
];

function LogoutForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action="/api/admin/logout" method="post">
      <button
        type="submit"
        className={`min-h-10 border border-line px-3 text-sm text-steel transition-colors hover:border-red-400/40 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          compact ? "w-full" : ""
        }`}
      >
        Sair
      </button>
    </form>
  );
}

function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label="Navegação do painel"
      className={mobile ? "flex min-w-max gap-2" : "grid gap-1"}
    >
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`min-h-10 border border-transparent px-3 py-2 text-sm text-muted transition-colors hover:border-line hover:bg-surface-2 hover:text-fg ${
            mobile ? "whitespace-nowrap" : "block"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <Link
          href="/admin"
          className="flex items-center gap-3 border-b border-line px-5 py-5 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Image src="/logo-acb.png" alt="" width={42} height={42} className="object-contain" />
          <span>
            <span className="block font-display text-lg font-bold uppercase text-fg">
              Painel ACB
            </span>
            <span className="block text-[11px] text-muted">Usinagem CNC</span>
          </span>
        </Link>
        <div className="px-3 py-5">
          <p className="px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Administração
          </p>
          <div className="mt-3">
            <AdminNavigation />
          </div>
        </div>
        <div className="mt-auto space-y-3 border-t border-line p-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center border border-line px-3 text-sm text-steel transition-colors hover:border-accent/50 hover:text-accent"
          >
            Ver site
          </Link>
          <LogoutForm compact />
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/logo-acb.png" alt="" width={34} height={34} className="object-contain" />
              <span className="font-display text-base font-bold uppercase">Painel ACB</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-10 border border-line px-3 py-2 text-xs text-steel"
              >
                Ver site
              </Link>
              <LogoutForm />
            </div>
          </div>
          <div className="overflow-x-auto border-t border-line px-3 py-2">
            <AdminNavigation mobile />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
