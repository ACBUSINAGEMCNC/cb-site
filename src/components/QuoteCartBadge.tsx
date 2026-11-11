"use client";

import Link from "next/link";
import { useQuoteCart } from "@/components/cart/CartProvider";

export default function QuoteCartBadge() {
  const { count, hydrated } = useQuoteCart();

  return (
    <Link
      href="/orcamento"
      aria-label="Ver orçamento"
      className="relative grid h-11 w-11 place-items-center border border-line text-steel transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="M3 5h2.2l2.1 10.4a1.6 1.6 0 0 0 1.57 1.3h8.7a1.6 1.6 0 0 0 1.56-1.24L21 8.5H6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.6" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17.4" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {hydrated && count > 0 ? (
        <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center border border-line bg-accent px-1 font-mono text-[10px] font-semibold leading-none text-accent-fg">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      <span className="sr-only">Orçamento</span>
    </Link>
  );
}
