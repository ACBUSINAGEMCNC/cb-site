import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";

const machines = [
  { slug: "colheitadeira", label: "Colheitadeira" },
  { slug: "plantadeira", label: "Plantadeira" },
  { slug: "pulverizador", label: "Pulverizador" },
];

const services = [
  { href: "/servicos#usinagem-cnc", label: "Usinagem CNC" },
  { href: "/servicos#engenharia-reversa", label: "Engenharia reversa" },
  { href: "/servicos#desenvolvimento", label: "Desenvolvimento" },
  { href: "/servicos#pecas-sob-demanda", label: "Peças sob demanda" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-xl font-bold uppercase text-fg">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            Usinagem CNC e desenvolvimento de peças agrícolas com atendimento direto.
          </p>
          <p className="mt-3 font-mono text-xs text-steel">{SITE.city}</p>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Catálogo
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {machines.map((machine) => (
              <li key={machine.slug}>
                <Link
                  href={`/pecas?categoria=${machine.slug}`}
                  className="transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {machine.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Serviços
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {services.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Contato
          </h2>
          <Link
            href={whatsappLink("Olá! Gostaria de falar com a equipe da ACB.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-fg transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true" className="h-2 w-2 bg-green" />
            WhatsApp {SITE.whatsappDisplay}
          </Link>
          <p className="mt-2 text-sm text-muted">{SITE.city}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-line px-4 py-5 sm:px-6 lg:px-8">
        <p className="max-w-5xl text-xs leading-5 text-muted">
          Peças similares/compatíveis. John Deere é marca registrada de seus respectivos
          proprietários; não somos revenda autorizada.
        </p>
        <p className="mt-4 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.legalName}
        </p>
      </div>
    </footer>
  );
}
