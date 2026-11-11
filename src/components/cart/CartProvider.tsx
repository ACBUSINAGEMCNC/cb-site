"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type QuoteCartItem = {
  productId: number | null;
  slug: string;
  code: string;
  name: string;
  image: string | null;
  machine: string | null;
  qty: number;
};

export type QuoteCartProductInput = {
  productId?: number | null;
  slug: string;
  code: string;
  name: string;
  image?: string | null;
  machine?: string | null;
};

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  addItem: (product: QuoteCartProductInput, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  count: number;
  hydrated: boolean;
};

const STORAGE_KEY = "acb-orcamento";
const EMPTY_ITEMS: QuoteCartItem[] = [];

let itemsCache: QuoteCartItem[] | null = null;
const listeners = new Set<() => void>();

function sanitizeItems(value: unknown): QuoteCartItem[] {
  if (!value || typeof value !== "object") return [];
  const rawItems = Array.isArray(value)
    ? value
    : Array.isArray((value as { items?: unknown }).items)
      ? (value as { items: unknown[] }).items
      : [];

  return rawItems
    .map((raw): QuoteCartItem | null => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Partial<QuoteCartItem>;
      if (typeof item.slug !== "string" || !item.slug) return null;
      const qty = Number(item.qty);
      return {
        productId:
          typeof item.productId === "number" && Number.isInteger(item.productId)
            ? item.productId
            : null,
        slug: item.slug,
        code: typeof item.code === "string" ? item.code : item.slug.toUpperCase(),
        name: typeof item.name === "string" ? item.name : item.slug,
        image: typeof item.image === "string" ? item.image : null,
        machine: typeof item.machine === "string" ? item.machine : null,
        qty: Number.isFinite(qty) && qty > 0 ? Math.min(999, Math.trunc(qty)) : 1,
      };
    })
    .filter((item): item is QuoteCartItem => item !== null);
}

function readItems(): QuoteCartItem[] {
  if (itemsCache) return itemsCache;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    itemsCache = stored ? sanitizeItems(JSON.parse(stored)) : [];
  } catch {
    itemsCache = [];
  }
  return itemsCache;
}

function writeItems(next: QuoteCartItem[]) {
  itemsCache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: next }));
  } catch {
    // storage indisponível — mantém apenas em memória
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      itemsCache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getItemsSnapshot() {
  return readItems();
}

function getServerItemsSnapshot() {
  return EMPTY_ITEMS;
}

const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    getItemsSnapshot,
    getServerItemsSnapshot
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );

  const addItem = useCallback((product: QuoteCartProductInput, qty = 1) => {
    const current = readItems();
    const existing = current.find((item) => item.slug === product.slug);
    if (existing) {
      writeItems(
        current.map((item) =>
          item.slug === product.slug
            ? { ...item, qty: Math.min(999, item.qty + qty) }
            : item
        )
      );
      return;
    }
    writeItems([
      ...current,
      {
        productId: product.productId ?? null,
        slug: product.slug,
        code: product.code,
        name: product.name,
        image: product.image ?? null,
        machine: product.machine ?? null,
        qty: Math.max(1, Math.min(999, Math.trunc(qty))),
      },
    ]);
  }, []);

  const removeItem = useCallback((slug: string) => {
    writeItems(readItems().filter((item) => item.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    writeItems(
      readItems().map((item) =>
        item.slug === slug
          ? {
              ...item,
              qty: Number.isFinite(qty)
                ? Math.max(1, Math.min(999, Math.trunc(qty)))
                : 1,
            }
          : item
      )
    );
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const count = useMemo(
    () => items.reduce((total, item) => total + item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQty, clear, count, hydrated }),
    [items, addItem, removeItem, setQty, clear, count, hydrated]
  );

  return (
    <QuoteCartContext.Provider value={value}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error("useQuoteCart deve ser usado dentro de QuoteCartProvider");
  }
  return context;
}
