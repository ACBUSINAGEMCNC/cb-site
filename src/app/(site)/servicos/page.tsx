import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";

const services = [
  {
    id: "usinagem-cnc",
    title: "Usinagem CNC",
    image: "/service-cnc-industrial-v2.jpg",
    alt: "Centro industrial de usinagem CNC",
    description:
      "Tornos e centros de usinagem para fabricar componentes com repetibilidade e controle dimensional.",
    bullets: [
      "Produção de séries e lotes.",
      "Torneamento e fresamento CNC.",
      "Acompanhamento conforme desenho ou especificação.",
    ],
  },
  {
    id: "engenharia-reversa",
    title: "Engenharia reversa e scanner 3D",
    image: "/service-3d-scanner-v2.jpg",
    alt: "Equipamento de digitalização 3D",
    description:
      "Apoio ao desenvolvimento quando a referência é uma amostra, desenho ou peça desgastada.",
    bullets: [
      "Digitalização dimensional de componentes.",
      "Modelagem para recuperação ou reprodução.",
      "Suporte técnico ao desenvolvimento.",
    ],
  },
  {
    id: "desenvolvimento",
    title: "Peças e modelos para fundição",
    image: "/service-cnc-lathe.jpg",
    alt: "Torno CNC em operação",
    description:
      "Desenvolvimento de peças e modelos para fundição conforme os requisitos do projeto.",
    bullets: [
      "Análise de desenho ou amostra.",
      "Desenvolvimento de geometria sob medida.",
      "Usinagem de modelos e componentes.",
    ],
  },
  {
    id: "pecas-sob-demanda",
    title: "Peças sob demanda",
    image: "/service-machining-center.jpg",
    alt: "Centro de usinagem trabalhando uma peça",
    description:
      "Usinagem de componentes sob demanda para outras marcas e linhas de máquinas.",
    bullets: [
      "Peças especiais conforme aplicação.",
      "Lotes sob desenho ou amostra.",
      "Consulta direta à equipe técnica.",
    ],
  },
];

export default function ServicosPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Recursos industriais
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.035em] text-fg sm:text-6xl">
          Serviços
        </h1>
        <div className="hazard-stripe mt-4 w-20" aria-hidden="true" />
        <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
          Usinagem CNC, desenvolvimento e suporte técnico para componentes agrícolas e
          industriais, com atendimento direto em Cascavel - PR.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className="grid scroll-mt-28 overflow-hidden border border-line bg-surface md:grid-cols-2"
          >
            <div
              className={`relative min-h-64 bg-surface-2 md:min-h-[350px] ${
                index % 2 === 1 ? "md:order-2" : ""
              }`}
            >
              <Image
                src={service.image}
                alt={service.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 border border-line bg-bg/80 px-2 py-1 font-mono text-[10px] text-steel">
                0{index + 1}
              </span>
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
                Capacidade produtiva
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-fg">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{service.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-steel">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={whatsappLink(`Olá! Gostaria de consultar sobre ${service.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 w-fit items-center border border-line px-4 text-sm font-semibold text-fg transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Consultar pelo WhatsApp
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
