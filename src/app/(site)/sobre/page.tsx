import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { whatsappLink } from "@/lib/site";

const values = [
  {
    title: "Qualidade",
    description:
      "Atenção aos requisitos, medidas e acabamento de cada componente produzido.",
  },
  {
    title: "Tecnologia",
    description:
      "Usinagem CNC, metrologia e recursos de digitalização aplicados ao desenvolvimento.",
  },
  {
    title: "Atendimento",
    description:
      "Contato direto para entender a aplicação e orientar a consulta de cada peça.",
  },
];

export default function SobrePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          ACB Usinagem CNC e Artcompany
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.035em] text-fg sm:text-6xl">
          Experiência industrial ligada ao campo
        </h1>
        <div className="hazard-stripe mt-4 w-20" aria-hidden="true" />
      </div>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-line bg-surface p-5 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
            Desde 2013
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase text-fg">
            Artcompany
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
            <p>
              Fundada em 2013 em Cascavel, no Paraná, a Artcompany atua na produção de
              peças agrícolas similares e compatíveis, com atenção à qualidade e à
              durabilidade.
            </p>
            <p>
              Seus fundadores, Celso José de Moura e Adriana Silva dos Santos,
              identificaram a necessidade de peças agrícolas de alta qualidade e
              durabilidade. Essa iniciativa deu origem à Artcompany.
            </p>
            <p>
              A empresa cresceu investindo em tecnologia e mão de obra especializada,
              atendendo clientes em todo o território nacional.
            </p>
          </div>
        </article>

        <aside className="flex flex-col justify-between border border-line bg-surface-2 p-5 sm:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
              Usinagem e desenvolvimento
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-fg">
              ACB Usinagem CNC Ltda.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Estrutura dedicada à usinagem CNC, ao desenvolvimento e ao suporte
              industrial, em conjunto com a experiência da Artcompany no setor agrícola.
            </p>
          </div>
          <p className="mt-8 border-t border-line pt-4 font-mono text-xs text-steel">
            Cascavel - PR
          </p>
        </aside>
      </section>

      <section className="mt-16">
        <SectionTitle kicker="Princípios de trabalho" title="Nossos valores" />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <article key={value.title} className="border border-line bg-surface p-5 sm:p-6">
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <h3 className="mt-5 font-display text-2xl font-bold uppercase text-fg">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 border border-line bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
            Fale com a equipe
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">
            Conte sobre sua necessidade
          </h2>
        </div>
        <Link
          href={whatsappLink("Olá! Gostaria de conhecer melhor a ACB Usinagem CNC.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg sm:mt-0"
        >
          Falar no WhatsApp
        </Link>
      </section>
    </main>
  );
}
