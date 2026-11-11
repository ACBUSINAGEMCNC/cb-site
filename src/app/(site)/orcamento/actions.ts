"use server";

import { prisma } from "@/lib/prisma";

export type SubmitQuoteItem = {
  productId?: number | null;
  slug: string;
  code: string;
  name: string;
  qty: number;
};

export type SubmitQuoteCustomer = {
  name: string;
  phone: string;
  company?: string;
  city?: string;
  email?: string;
  message?: string;
};

export type SubmitQuoteResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function submitQuote(
  items: SubmitQuoteItem[],
  customer: SubmitQuoteCustomer
): Promise<SubmitQuoteResult> {
  const name = (customer?.name ?? "").trim();
  const phone = (customer?.phone ?? "").trim();

  if (!name || !phone) {
    return { ok: false, error: "Informe nome e telefone." };
  }

  const cleanItems = (Array.isArray(items) ? items : [])
    .map((item) => ({
      slug: String(item?.slug ?? "").trim(),
      code: String(item?.code ?? "").trim(),
      name: String(item?.name ?? "").trim(),
      qty: Number.isFinite(Number(item?.qty))
        ? Math.max(1, Math.min(999, Math.trunc(Number(item.qty))))
        : 1,
    }))
    .filter((item) => item.slug && item.code && item.name);

  if (cleanItems.length === 0) {
    return { ok: false, error: "Adicione ao menos uma peça ao orçamento." };
  }

  // Resolve o productId pelo slug quando a peça existir no catálogo.
  const products = await prisma.product.findMany({
    where: { slug: { in: cleanItems.map((item) => item.slug) } },
    select: { id: true, slug: true },
  });
  const productIdBySlug = new Map(products.map((p) => [p.slug, p.id]));

  try {
    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        phone,
        company: customer.company?.trim() || null,
        city: customer.city?.trim() || null,
        email: customer.email?.trim() || null,
        message: customer.message?.trim() || null,
        items: {
          create: cleanItems.map((item) => ({
            productId: productIdBySlug.get(item.slug) ?? null,
            code: item.code,
            name: item.name,
            quantity: item.qty,
          })),
        },
      },
      select: { id: true },
    });

    return { ok: true, id: quote.id };
  } catch {
    return { ok: false, error: "Não foi possível registrar o pedido. Tente novamente." };
  }
}
