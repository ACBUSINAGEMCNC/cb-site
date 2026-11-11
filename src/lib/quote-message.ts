import { SITE, whatsappLink } from "@/lib/site";

export type QuoteMessageItem = {
  code: string;
  name: string;
  qty: number;
};

export type QuoteCustomer = {
  name: string;
  phone: string;
  company?: string | null;
  city?: string | null;
  email?: string | null;
  message?: string | null;
};

export function formatQuoteNumber(id: number) {
  return `#${String(id).padStart(4, "0")}`;
}

export function buildQuoteMessage(
  quoteId: number,
  items: QuoteMessageItem[],
  customer: QuoteCustomer
) {
  const lines = [
    `Olá! Orçamento ${formatQuoteNumber(quoteId)}`,
    ...items.map(
      (item) => `• ${item.code} ${item.name.toUpperCase()} x${item.qty}`
    ),
    `Nome: ${customer.name}`,
    `Telefone: ${customer.phone}`,
  ];

  if (customer.company) lines.push(`Empresa: ${customer.company}`);
  if (customer.city) lines.push(`Cidade: ${customer.city}`);

  return lines.join("\n");
}

export function quoteWhatsAppLink(
  quoteId: number,
  items: QuoteMessageItem[],
  customer: QuoteCustomer
) {
  return whatsappLink(buildQuoteMessage(quoteId, items, customer));
}

/** Monta um link wa.me para responder ao cliente. Usa o telefone informado; cai no número da ACB se inválido. */
export function customerWhatsAppLink(phone: string | null, message: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  const target =
    normalized.length >= 12 && normalized.length <= 14
      ? normalized
      : SITE.whatsappNumber;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}
