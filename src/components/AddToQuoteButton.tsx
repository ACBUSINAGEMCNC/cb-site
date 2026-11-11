"use client";

import { useEffect, useRef, useState } from "react";
import { useQuoteCart, type QuoteCartProductInput } from "@/components/cart/CartProvider";

type AddToQuoteButtonProps = {
  product: QuoteCartProductInput;
  size?: "sm" | "lg";
  className?: string;
};

export default function AddToQuoteButton({
  product,
  size = "sm",
  className = "",
}: AddToQuoteButtonProps) {
  const { items, addItem, hydrated } = useQuoteCart();
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const existing = items.find((item) => item.slug === product.slug);

  function handleClick() {
    addItem(product, 1);
    setJustAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustAdded(false), 1500);
  }

  const label = !hydrated
    ? "Adicionar ao orçamento"
    : justAdded
      ? "Adicionado ✓"
      : existing
        ? `No orçamento (${existing.qty})`
        : "Adicionar ao orçamento";

  const baseClass =
    size === "lg"
      ? "min-h-12 px-5 text-sm font-bold"
      : "min-h-10 px-3 text-xs font-semibold";

  const stateClass = existing
    ? "border-accent/60 bg-accent/15 text-accent hover:border-accent"
    : "border-accent bg-accent text-accent-fg hover:bg-accent/90";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative z-20 inline-flex w-full items-center justify-center border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${baseClass} ${stateClass} ${className}`}
    >
      {label}
    </button>
  );
}
