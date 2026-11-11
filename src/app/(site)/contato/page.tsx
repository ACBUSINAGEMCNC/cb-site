import Link from "next/link";
import ContactQuoteForm from "@/components/ContactQuoteForm";
import SectionTitle from "@/components/SectionTitle";
import { SITE, whatsappLink } from "@/lib/site";

export default function ContatoPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionTitle
        kicker="Atendimento direto"
        title="Contato"
        description="Fale com a equipe sobre uma peça, um desenho ou um projeto de usinagem."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-line bg-surface p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">WhatsApp</p>
          <p className="mt-4 font-display text-2xl font-bold uppercase text-fg">
            {SITE.whatsappDisplay}
          </p>
          <Link
            href={whatsappLink("Olá! Gostaria de falar com a equipe da ACB.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-10 items-center border border-line px-3 text-sm text-steel hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            Iniciar conversa
          </Link>
        </article>
        <article className="border border-line bg-surface p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            Localização
          </p>
          <p className="mt-4 font-display text-2xl font-bold uppercase text-fg">
            {SITE.city}
          </p>
          <p className="mt-2 text-sm text-muted">Atendimento a clientes em todo o Brasil.</p>
        </article>
        <article className="border border-line bg-surface p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Horário</p>
          <p className="mt-4 font-display text-2xl font-bold uppercase text-fg">
            Seg a Sex
          </p>
          <p className="mt-2 text-sm text-muted">Horário comercial</p>
        </article>
      </div>

      <div className="mt-10">
        <ContactQuoteForm />
      </div>
    </main>
  );
}
