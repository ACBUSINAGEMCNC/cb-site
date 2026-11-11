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
  flyToCart: (sourceRect: DOMRect, imageUrl?: string | null) => void;
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

  const flyToCart = useCallback(
    (sourceRect: DOMRect, imageUrl?: string | null) => {
      if (typeof document === "undefined") return;

      // O badge existe duas vezes no header (desktop e mobile) — usa o visível.
      const icons = Array.from(
        document.querySelectorAll<HTMLElement>("#quote-cart-icon")
      );
      const icon =
        icons.find((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }) ?? icons[0];
      if (!icon) return;
      const targetRect = icon.getBoundingClientRect();
      if (targetRect.width === 0 || targetRect.height === 0) return;

      const bumpIcon = () => {
        icon.classList.remove("quote-cart-bump");
        void icon.offsetWidth; // reinicia a animação
        icon.classList.add("quote-cart-bump");
        window.setTimeout(
          () => icon.classList.remove("quote-cart-bump"),
          450
        );
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        bumpIcon();
        return;
      }

      const size = 64;
      const startX = sourceRect.left + sourceRect.width / 2 - size / 2;
      const startY = sourceRect.top + sourceRect.height / 2 - size / 2;
      const endX = targetRect.left + targetRect.width / 2 - size / 2;
      const endY = targetRect.top + targetRect.height / 2 - size / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.hypot(dx, dy);
      const lift = Math.min(distance * 0.15, 140);
      const spin = dx >= 0 ? 1 : -1;

      const ghost = imageUrl
        ? document.createElement("img")
        : document.createElement("div");
      if (ghost instanceof HTMLImageElement && imageUrl) {
        ghost.src = imageUrl;
        ghost.alt = "";
      }
      ghost.setAttribute("aria-hidden", "true");
      Object.assign(ghost.style, {
        position: "fixed",
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        padding: "6px",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: "4px",
        background: imageUrl ? "#14171b" : "#f5b800",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        zIndex: "9999",
        pointerEvents: "none",
        willChange: "transform, opacity",
      });
      document.body.appendChild(ghost);

      const animation = ghost.animate(
        [
          {
            transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)",
            opacity: 1,
          },
          {
            transform: `translate3d(${dx * 0.5}px, ${dy * 0.5 - lift}px, 0) rotate(${160 * spin}deg) scale(0.4)`,
            opacity: 0.9,
            offset: 0.55,
          },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${320 * spin}deg) scale(0.31)`,
            opacity: 0,
          },
        ],
        { duration: 650, easing: "ease-in-out", fill: "forwards" }
      );

      animation.finished
        .then(() => {
          ghost.remove();
          bumpIcon();
        })
        .catch(() => {
          ghost.remove();
        });
    },
    []
  );

  const count = useMemo(
    () => items.reduce((total, item) => total + item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQty,
      clear,
      count,
      hydrated,
      flyToCart,
    }),
    [items, addItem, removeItem, setQty, clear, count, hydrated, flyToCart]
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
