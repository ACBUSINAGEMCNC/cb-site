"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";

type NavigationItem = {
  href: string;
  label: string;
};

export default function MobileSiteMenu({
  navigation,
}: {
  navigation: NavigationItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="grid h-11 w-11 place-items-center border border-line text-fg transition-colors hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          {open ? (
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      <div
        id="mobile-navigation"
        hidden={!open}
        className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(90vw,22rem)] border border-line bg-surface p-4 shadow-2xl shadow-black/40"
      >
          <nav aria-label="Navegação móvel" className="grid">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-sm text-fg transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/pecas" method="get" role="search" className="mt-4">
            <label htmlFor="mobile-site-search" className="sr-only">
              Buscar no catálogo
            </label>
            <input
              id="mobile-site-search"
              name="q"
              type="search"
              placeholder="Buscar código ou nome"
              className="h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              className="mt-2 h-10 w-full border border-line text-sm text-steel transition-colors hover:border-accent/50 hover:text-accent"
            >
              Buscar no catálogo
            </button>
          </form>
          <Link
            href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-11 items-center justify-center bg-accent px-4 text-sm font-bold text-accent-fg"
          >
            Orçamento no WhatsApp
          </Link>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
            {SITE.whatsappDisplay}
          </p>
      </div>
    </div>
  );
}
