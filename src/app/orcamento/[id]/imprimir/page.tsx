import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PrintButton from "@/components/cart/PrintButton";
import { prisma } from "@/lib/prisma";
import { formatQuoteNumber } from "@/lib/quote-message";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido de orçamento",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string | string[] }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrcamentoImprimirPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId) || quoteId <= 0) notFound();

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!quote) notFound();

  const number = formatQuoteNumber(quote.id);
  const autoPrint = first(query.auto) === "1";
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(quote.createdAt);
  const totalUnits = quote.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-neutral-100 py-8 text-neutral-900 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-neutral-500">
            Use a janela de impressão para salvar em PDF.
          </p>
          <PrintButton autoPrint={autoPrint} />
        </div>

        <article className="border border-neutral-300 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-neutral-900 pb-5">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-acb.png"
                alt=""
                width={52}
                height={52}
                className="h-13 w-13 object-contain"
              />
              <div>
                <p className="font-display text-2xl font-bold uppercase leading-none">
                  {SITE.name}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {SITE.legalName} · {SITE.city}
                </p>
                <p className="text-xs text-neutral-500">
                  WhatsApp {SITE.whatsappDisplay}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold">Orçamento {number}</p>
              <p className="mt-1 text-xs text-neutral-500">Emitido em {date}</p>
            </div>
          </header>

          <section className="mt-6">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Dados do cliente
            </h2>
            <dl className="mt-2 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-neutral-500">Nome</dt>
                <dd className="font-medium">{quote.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Telefone</dt>
                <dd className="font-medium">{quote.phone}</dd>
              </div>
              {quote.company ? (
                <div>
                  <dt className="text-xs text-neutral-500">Empresa</dt>
                  <dd className="font-medium">{quote.company}</dd>
                </div>
              ) : null}
              {quote.city ? (
                <div>
                  <dt className="text-xs text-neutral-500">Cidade</dt>
                  <dd className="font-medium">{quote.city}</dd>
                </div>
              ) : null}
              {quote.message ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-neutral-500">Observações</dt>
                  <dd className="font-medium whitespace-pre-wrap">
                    {quote.message}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="mt-7">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Peças solicitadas
            </h2>
            <table className="mt-3 w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-xs uppercase tracking-wider text-neutral-500">
                  <th className="py-2 pr-4 font-semibold">Código</th>
                  <th className="py-2 pr-4 font-semibold">Peça</th>
                  <th className="py-2 text-right font-semibold">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-200 align-top"
                  >
                    <td className="py-2.5 pr-4 font-mono font-semibold">
                      {item.code}
                    </td>
                    <td className="py-2.5 pr-4">{item.name}</td>
                    <td className="py-2.5 text-right font-mono">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={2}
                    className="py-2.5 text-xs uppercase tracking-wider text-neutral-500"
                  >
                    Total de unidades
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold">
                    {totalUnits}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <footer className="mt-8 border-t border-neutral-300 pt-4 text-xs leading-5 text-neutral-500">
            <p>
              Pedido de orçamento sem valores — a disponibilidade e os preços são
              confirmados pela equipe {SITE.name}.
            </p>
            <p>
              WhatsApp {SITE.whatsappDisplay} · {SITE.city}
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
