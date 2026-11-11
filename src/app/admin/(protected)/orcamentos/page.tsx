import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatQuoteNumber } from "@/lib/quote-message";
import { quoteStatusClass, quoteStatusLabel } from "@/lib/quoteStatus";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type SearchParams = { page?: string | string[] };

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminOrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requestedPage = Number(first(params.page) ?? 1);
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const [total, newCount] = await Promise.all([
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: "novo" } }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Painel ACB
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Orçamentos
          </h1>
        </div>
        {newCount > 0 ? (
          <p className="border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-accent">
            {newCount} {newCount === 1 ? "novo" : "novos"}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-xs text-muted">
        {total} {total === 1 ? "pedido registrado" : "pedidos registrados"}
      </p>

      <div className="mt-4 hidden overflow-hidden border border-line bg-surface lg:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nº</th>
              <th className="px-3 py-3 font-medium">Data</th>
              <th className="px-3 py-3 font-medium">Cliente</th>
              <th className="px-3 py-3 font-medium">Telefone</th>
              <th className="px-3 py-3 font-medium">Itens</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {quotes.map((quote) => (
              <tr key={quote.id} className="align-middle">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orcamentos/${quote.id}`}
                    className="font-mono text-sm font-semibold text-accent hover:underline"
                  >
                    {formatQuoteNumber(quote.id)}
                  </Link>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-muted">
                  {dateFormatter.format(quote.createdAt)}
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-fg">{quote.name}</p>
                  {quote.company ? (
                    <p className="text-xs text-muted">{quote.company}</p>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-sm text-steel">{quote.phone}</td>
                <td className="px-3 py-3 font-mono text-sm text-steel">
                  {quote._count.items}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${quoteStatusClass(quote.status)}`}
                  >
                    {quoteStatusLabel(quote.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            Nenhum orçamento recebido ainda.
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 lg:hidden">
        {quotes.map((quote) => (
          <Link
            key={quote.id}
            href={`/admin/orcamentos/${quote.id}`}
            className="block border border-line bg-surface p-4 transition-colors hover:border-accent/40"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-sm font-semibold text-accent">
                {formatQuoteNumber(quote.id)}
              </p>
              <span
                className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${quoteStatusClass(quote.status)}`}
              >
                {quoteStatusLabel(quote.status)}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-fg">{quote.name}</p>
            <p className="mt-1 text-xs text-muted">
              {dateFormatter.format(quote.createdAt)} · {quote.phone} ·{" "}
              {quote._count.items}{" "}
              {quote._count.items === 1 ? "item" : "itens"}
            </p>
          </Link>
        ))}
        {quotes.length === 0 ? (
          <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
            Nenhum orçamento recebido ainda.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação de orçamentos"
          className="mt-6 flex items-center justify-between border-t border-line pt-4"
        >
          {currentPage > 1 ? (
            <Link
              href={`/admin/orcamentos?page=${currentPage - 1}`}
              className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
            >
              Anterior
            </Link>
          ) : (
            <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/40">
              Anterior
            </span>
          )}
          <span className="font-mono text-xs text-muted">
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={`/admin/orcamentos?page=${currentPage + 1}`}
              className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
            >
              Próxima
            </Link>
          ) : (
            <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/40">
              Próxima
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
