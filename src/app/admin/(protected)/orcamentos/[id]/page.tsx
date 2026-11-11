import Link from "next/link";
import { notFound } from "next/navigation";
import { updateQuoteStatusAction } from "@/app/admin/(protected)/orcamentos/actions";
import { prisma } from "@/lib/prisma";
import { customerWhatsAppLink, formatQuoteNumber } from "@/lib/quote-message";
import {
  QUOTE_STATUSES,
  quoteStatusClass,
  quoteStatusLabel,
} from "@/lib/quoteStatus";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminOrcamentoDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId) || quoteId <= 0) notFound();

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: { product: { select: { slug: true } } },
      },
    },
  });
  if (!quote) notFound();

  const number = formatQuoteNumber(quote.id);
  const totalUnits = quote.items.reduce((sum, item) => sum + item.quantity, 0);
  const replyLink = customerWhatsAppLink(
    quote.phone,
    `Olá, ${quote.name}! Aqui é da ACB. Recebemos seu orçamento ${number} e vamos te retornar com disponibilidade e valores.`
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/orcamentos"
            className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-accent"
          >
            ← Orçamentos
          </Link>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Orçamento {number}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {dateFormatter.format(quote.createdAt)}
          </p>
        </div>
        <span
          className={`border px-3 py-2 font-mono text-xs uppercase tracking-wider ${quoteStatusClass(quote.status)}`}
        >
          {quoteStatusLabel(quote.status)}
        </span>
      </div>

      {first(query.saved) === "1" ? (
        <p
          role="status"
          className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg"
        >
          Status atualizado.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <section
          aria-label="Itens do orçamento"
          className="border border-line bg-surface"
        >
          <header className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-bold uppercase text-fg">
              Itens solicitados
            </h2>
            <p className="font-mono text-xs text-muted">
              {totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}
            </p>
          </header>
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Peça</th>
                <th className="px-5 py-3 text-right font-medium">Qtd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quote.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-5 py-3 font-mono text-sm font-semibold text-accent">
                    {item.code}
                  </td>
                  <td className="px-3 py-3 text-sm text-fg">
                    {item.product ? (
                      <Link
                        href={`/pecas/${item.product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-sm text-steel">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="grid gap-4">
          <section className="border border-line bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Cliente
            </h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Nome</dt>
                <dd className="text-fg">{quote.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Telefone</dt>
                <dd className="text-fg">{quote.phone}</dd>
              </div>
              {quote.company ? (
                <div>
                  <dt className="text-xs text-muted">Empresa</dt>
                  <dd className="text-fg">{quote.company}</dd>
                </div>
              ) : null}
              {quote.city ? (
                <div>
                  <dt className="text-xs text-muted">Cidade</dt>
                  <dd className="text-fg">{quote.city}</dd>
                </div>
              ) : null}
              {quote.message ? (
                <div>
                  <dt className="text-xs text-muted">Observações</dt>
                  <dd className="whitespace-pre-wrap text-fg">
                    {quote.message}
                  </dd>
                </div>
              ) : null}
            </dl>
            <Link
              href={replyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center bg-accent px-4 text-xs font-bold text-accent-fg transition-colors hover:bg-accent/90"
            >
              Responder no WhatsApp
            </Link>
            <Link
              href={`/orcamento/${quote.id}/imprimir`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center border border-line px-4 text-xs font-semibold text-steel transition-colors hover:border-accent/50 hover:text-accent"
            >
              Ver pedido para impressão
            </Link>
          </section>

          <section className="border border-line bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Status do atendimento
            </h2>
            <form action={updateQuoteStatusAction} className="mt-3 grid gap-3">
              <input type="hidden" name="quoteId" value={quote.id} />
              <label className="text-xs text-muted">
                Status
                <select
                  name="status"
                  defaultValue={quote.status}
                  className="mt-2 min-h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent"
                >
                  {QUOTE_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="min-h-10 border border-line px-4 text-sm font-semibold text-steel transition-colors hover:border-accent/50 hover:text-accent"
              >
                Atualizar status
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
