import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatQuoteNumber } from "@/lib/quote-message";
import { quoteStatusClass, quoteStatusLabel } from "@/lib/quoteStatus";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    activeProducts,
    productsWithoutImages,
    categories,
    highlights,
    recentQuotes,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({
      where: { isActive: true, images: { none: {} } },
    }),
    prisma.category.count(),
    prisma.product.count({ where: { isHighlighted: true, isActive: true } }),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const stats = [
    { label: "Peças ativas", value: activeProducts },
    { label: "Sem foto", value: productsWithoutImages },
    { label: "Categorias", value: categories },
    { label: "Destaques", value: highlights },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Administração
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Dashboard
          </h1>
        </div>
        <Link
          href="/admin/pecas/nova"
          className="min-h-11 bg-accent px-5 py-3 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90"
        >
          Nova peça
        </Link>
      </div>

      <section aria-label="Resumo do catálogo" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="border border-line bg-surface p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-3 font-mono text-4xl text-fg">{stat.value}</p>
          </article>
        ))}
      </section>

      {activeProducts === 0 ? (
        <section
          role="status"
          className="mt-6 flex flex-col gap-4 border border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-fg">
              Catálogo vazio — importe as peças
            </h2>
            <p className="mt-1 text-sm text-muted">
              Carregue as peças dos três catálogos para começar.
            </p>
          </div>
          <Link
            href="/admin/backup"
            className="inline-flex min-h-10 items-center justify-center bg-accent px-4 text-sm font-bold text-accent-fg"
          >
            Ir ao centro de backup
          </Link>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/pecas/nova"
          className="group border border-line bg-surface p-5 transition-colors hover:border-accent/40 sm:p-6"
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Cadastro
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase text-fg">
            Nova peça
          </h2>
          <p className="mt-2 text-sm text-muted">
            Cadastre código, aplicação e características da peça.
          </p>
        </Link>
        <Link
          href="/pecas"
          target="_blank"
          rel="noopener noreferrer"
          className="group border border-line bg-surface p-5 transition-colors hover:border-accent/40 sm:p-6"
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Vitrine pública
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase text-fg">
            Ver catálogo
          </h2>
          <p className="mt-2 text-sm text-muted">
            Confira como as peças ativas aparecem no site.
          </p>
        </Link>
      </section>

      <section className="mt-8 border border-line bg-surface">
        <header className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold uppercase text-fg">
            Orçamentos recentes
          </h2>
          <Link
            href="/admin/orcamentos"
            className="text-xs text-steel underline decoration-line underline-offset-4 hover:text-accent"
          >
            Ver todos
          </Link>
        </header>
        {recentQuotes.length > 0 ? (
          <ul className="divide-y divide-line">
            {recentQuotes.map((quote) => (
              <li key={quote.id}>
                <Link
                  href={`/admin/orcamentos/${quote.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-accent">
                      {formatQuoteNumber(quote.id)}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-fg">
                      {quote.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-xs text-muted">
                      {quote._count.items}{" "}
                      {quote._count.items === 1 ? "item" : "itens"}
                    </span>
                    <span
                      className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${quoteStatusClass(quote.status)}`}
                    >
                      {quoteStatusLabel(quote.status)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-muted">
            Nenhum orçamento recebido ainda.
          </p>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-5 border border-line bg-surface-2 p-5 sm:flex-row sm:items-center sm:p-6">
        <Image
          src="/logo-acb.png"
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-fg">
            Catálogo ACB
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Mantenha fotos e modelos atualizados para facilitar as consultas dos clientes.
          </p>
        </div>
      </section>
    </div>
  );
}
