"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitQuote } from "@/app/(site)/orcamento/actions";
import { useQuoteCart } from "@/components/cart/CartProvider";
import GearIcon from "@/components/GearIcon";
import { whatsappLink } from "@/lib/site";

const fieldClassName =
  "mt-2 min-h-11 w-full border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";

export default function QuoteCartClient() {
  const router = useRouter();
  const { items, setQty, removeItem, clear, count, hydrated } = useQuoteCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || items.length === 0) return;

    const formData = new FormData(event.currentTarget);
    const customer = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? ""),
      city: String(formData.get("city") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setError(null);
    startTransition(async () => {
      const result = await submitQuote(
        items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          code: item.code,
          name: item.name,
          qty: item.qty,
        })),
        customer
      );
      if (result.ok) {
        clear();
        router.push(`/orcamento/concluido?id=${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        Pedido de orçamento
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg sm:text-5xl">
        Seu orçamento
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Revise as peças, ajuste quantidades e envie — responderemos com
        disponibilidade e valores.
      </p>

      {!hydrated ? (
        <p className="mt-8 border border-line bg-surface p-6 text-sm text-muted">
          Carregando itens…
        </p>
      ) : items.length === 0 ? (
        <section className="mt-8 border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold uppercase text-fg">
            Seu orçamento está vazio
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Navegue pelo catálogo e adicione peças.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pecas"
              className="inline-flex min-h-11 items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver catálogo
            </Link>
            <Link
              href={whatsappLink("Olá! Quero consultar uma peça para minha máquina.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm font-semibold text-fg transition-colors hover:border-steel/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Falar no WhatsApp
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <section aria-label="Peças no orçamento">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
              <h2 className="font-display text-2xl font-bold uppercase text-fg">
                Peças selecionadas
              </h2>
              <p className="font-mono text-xs text-muted">
                {items.length} {items.length === 1 ? "item" : "itens"} · {count}{" "}
                {count === 1 ? "unidade" : "unidades"}
              </p>
            </div>

            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-5">
                  <Link
                    href={`/pecas/${item.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden border border-line product-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-steel/60">
                        <GearIcon className="h-8 w-8" />
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/pecas/${item.slug}`}
                      className="font-mono text-base font-bold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {item.code}
                    </Link>
                    <p className="mt-1 line-clamp-2 font-display text-base font-semibold uppercase leading-snug text-fg">
                      {item.name}
                    </p>
                    {item.machine ? (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        {item.machine}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center border border-line">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${item.code}`}
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className="grid h-9 w-9 place-items-center text-steel transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          −
                        </button>
                        <span className="min-w-10 text-center font-mono text-sm text-fg">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${item.code}`}
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="grid h-9 w-9 place-items-center text-steel transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="min-h-9 px-2 text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-red-300 focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <Link
                href="/pecas"
                className="text-sm text-steel underline decoration-line underline-offset-4 hover:text-accent"
              >
                ← Continuar escolhendo peças
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-red-300"
              >
                Limpar orçamento
              </button>
            </div>

            <Link
              href={whatsappLink(
                `Olá! Vim pelo site e tenho interesse nesses itens:\n${items
                  .map((item) => `• ${item.code} — ${item.name} (x${item.qty})`)
                  .join("\n")}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-green px-5 text-sm font-bold text-white transition-colors hover:bg-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 fill-current"
              >
                <path d="M12.04 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.3-1.39A9.95 9.95 0 1 0 12.04 2Zm0 18.13a8.14 8.14 0 0 1-4.16-1.14l-.3-.18-3.12.82.83-3.05-.19-.31a8.18 8.18 0 1 1 6.94 3.86Zm4.48-6.1c-.25-.13-1.45-.72-1.67-.8-.22-.09-.39-.13-.55.12-.17.25-.63.8-.77.96-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42-.14-.01-.31-.01-.47-.01-.17 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.12.17 1.72 2.63 4.17 3.69.58.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.45-.59 1.65-1.17.2-.57.2-1.06.14-1.17-.06-.1-.23-.17-.48-.3Z" />
              </svg>
              Enviar lista direto no WhatsApp
            </Link>
            <p className="mt-2 text-center text-xs text-muted">
              Abre o WhatsApp com a lista de peças pronta para enviar — sem
              precisar preencher o formulário.
            </p>
          </section>

          <form
            onSubmit={handleSubmit}
            className="border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-32"
          >
            <h2 className="font-display text-2xl font-bold uppercase text-fg">
              Seus dados
            </h2>
            <p className="mt-1 text-xs text-muted">
              A equipe responde pelo telefone ou WhatsApp informado.
            </p>

            <div className="mt-4 grid gap-4">
              <label className="text-xs font-medium text-steel">
                Nome *
                <input
                  className={fieldClassName}
                  name="name"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="text-xs font-medium text-steel">
                Telefone / WhatsApp *
                <input
                  className={fieldClassName}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                />
              </label>
              <label className="text-xs font-medium text-steel">
                Empresa
                <input
                  className={fieldClassName}
                  name="company"
                  autoComplete="organization"
                />
              </label>
              <label className="text-xs font-medium text-steel">
                Cidade
                <input
                  className={fieldClassName}
                  name="city"
                  autoComplete="address-level2"
                />
              </label>
              <label className="text-xs font-medium text-steel">
                Observações
                <textarea
                  className={`${fieldClassName} min-h-24 resize-y`}
                  name="message"
                  rows={3}
                  placeholder="Aplicação, urgência, entrega…"
                />
              </label>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-200"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Enviar pedido de orçamento"}
            </button>
            <Link
              href={whatsappLink("Olá! Prefiro falar sobre um orçamento por aqui.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center text-xs font-semibold text-steel underline decoration-line underline-offset-4 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Falar direto no WhatsApp
            </Link>
          </form>
        </div>
      )}
    </main>
  );
}
