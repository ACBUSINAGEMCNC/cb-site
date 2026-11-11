import type { Metadata } from "next";
import QuoteCartClient from "@/components/cart/QuoteCartClient";

export const metadata: Metadata = {
  title: "Orçamento",
  description:
    "Revise as peças selecionadas e envie seu pedido de orçamento para a equipe ACB.",
};

export default function OrcamentoPage() {
  return <QuoteCartClient />;
}
