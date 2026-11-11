"use client";

import type { FormEvent } from "react";
import { whatsappLink } from "@/lib/site";

const fieldClassName =
  "mt-2 min-h-11 w-full border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";

export default function ContactQuoteForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const piece = String(formData.get("piece") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const text = [
      "Olá! Quero solicitar um orçamento.",
      `Nome: ${name}`,
      `Telefone: ${phone}`,
      piece ? `Máquina/código da peça: ${piece}` : "",
      message ? `Mensagem: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-surface p-5 sm:p-7">
      <h2 className="font-display text-2xl font-bold uppercase text-fg">
        Peça um retorno
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Sua solicitação será preparada para envio pelo WhatsApp.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-steel">
          Nome
          <input className={fieldClassName} name="name" autoComplete="name" required />
        </label>
        <label className="text-xs font-medium text-steel">
          Telefone
          <input
            className={fieldClassName}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
          />
        </label>
        <label className="text-xs font-medium text-steel sm:col-span-2">
          Máquina ou código da peça
          <input
            className={fieldClassName}
            name="piece"
            placeholder="Máquina ou código"
          />
        </label>
        <label className="text-xs font-medium text-steel sm:col-span-2">
          Mensagem
          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            name="message"
            rows={4}
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-5 min-h-11 w-full bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
      >
        Continuar no WhatsApp
      </button>
    </form>
  );
}
