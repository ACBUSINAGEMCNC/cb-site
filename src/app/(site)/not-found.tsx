import Link from "next/link";
import { whatsappLink } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        Erro 404
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-fg sm:text-7xl">
        Página não encontrada
      </h1>
      <div className="hazard-stripe mt-5 w-20" aria-hidden="true" />
      <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
        O endereço pode ter mudado ou a peça não está mais disponível no catálogo.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg"
        >
          Voltar ao início
        </Link>
        <Link
          href={whatsappLink("Olá! Não encontrei uma página/peça no site.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm font-semibold text-fg"
        >
          Falar com a equipe
        </Link>
      </div>
    </main>
  );
}
