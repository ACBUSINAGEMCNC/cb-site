import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatQuoteNumber, quoteWhatsAppLink } from "@/lib/quote-message";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orçamento enviado",
};

type SearchParams = { id?: string | string[] };

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrcamentoConcluidoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const quoteId = Number(first(params.id));
  if (!Number.isInteger(quoteId) || quoteId <= 0) notFound();

  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!quote) notFound();

  const number = formatQuoteNumber(quote.id);
  const messageItems = quote.items.map((item) => ({
    code: item.code,
    name: item.name,
    qty: item.quantity,
  }));
  const whatsappHref = quoteWhatsAppLink(quote.id, messageItems, {
    name: quote.name,
    phone: quote.phone,
    company: quote.company,
    city: quote.city,
  });
  const totalUnits = quote.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Pedido registrado
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none text-fg sm:text-6xl">
        Orçamento {number}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        Recebemos seu pedido, {quote.name.split(" ")[0]}. Para agilizar o
        retorno, envie o resumo pelo WhatsApp — nossa equipe confirma
        disponibilidade e valores.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-14 items-center justify-center bg-accent px-6 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Enviar no WhatsApp
        </Link>
        <Link
          href={`/orcamento/${quote.id}/imprimir`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-14 items-center justify-center border border-line px-6 text-sm font-semibold text-fg transition-colors hover:border-steel/50 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Baixar pedido (PDF)
        </Link>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        O WhatsApp não aceita anexos automáticos: envie a mensagem e, se
        quiser, anexe o PDF baixado.
      </p>

      <section
        aria-label="Resumo do pedido"
        className="mt-8 border border-line bg-surface"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold uppercase text-fg">
            Resumo do pedido
          </h2>
          <p className="font-mono text-xs text-muted">
            {quote.items.length}{" "}
            {quote.items.length === 1 ? "item" : "itens"} · {totalUnits}{" "}
            {totalUnits === 1 ? "unidade" : "unidades"}
          </p>
        </header>
        <ul className="divide-y divide-line">
          {quote.items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-accent">
                  {item.code}
                </p>
                <p className="mt-0.5 truncate text-sm text-fg">{item.name}</p>
              </div>
              <span className="shrink-0 font-mono text-sm text-steel">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
        <footer className="border-t border-line px-5 py-4 text-xs leading-5 text-muted">
          <p>
            {quote.name}
            {quote.company ? ` · ${quote.company}` : ""}
          </p>
          <p>
            {quote.phone}
            {quote.city ? ` · ${quote.city}` : ""}
          </p>
          {quote.message ? <p className="mt-1">Obs.: {quote.message}</p> : null}
        </footer>
      </section>

      <Link
        href="/pecas"
        className="mt-6 inline-flex text-sm text-steel underline decoration-line underline-offset-4 hover:text-accent"
      >
        ← Voltar ao catálogo
      </Link>
    </main>
  );
}
