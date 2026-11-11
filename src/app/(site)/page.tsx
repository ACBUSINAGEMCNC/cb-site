import Image from "next/image";
import Link from "next/link";
import MachineCard from "@/components/MachineCard";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";
import { prisma } from "@/lib/prisma";
import { SITE, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

const machineCards = [
  {
    slug: "colheitadeira",
    name: "Colheitadeira",
    image: "/catalog/colheitadeira/de20100.png",
  },
  {
    slug: "plantadeira",
    name: "Plantadeira",
    image: "/catalog/plantadeira/cq69513.png",
  },
  {
    slug: "pulverizador",
    name: "Pulverizador",
    image: "/catalog/pulverizador/an207684.png",
  },
];

const serviceTeasers = [
  {
    href: "/servicos#usinagem-cnc",
    image: "/service-cnc-industrial-v2.jpg",
    alt: "Centro industrial de usinagem CNC",
    title: "Usinagem CNC",
    copy: "Séries, lotes e componentes com precisão dimensional.",
  },
  {
    href: "/servicos#engenharia-reversa",
    image: "/service-3d-scanner-v2.jpg",
    alt: "Scanner 3D para engenharia reversa",
    title: "Engenharia reversa",
    copy: "Desenvolvimento a partir de amostra, desenho ou peça desgastada.",
  },
  {
    href: "/servicos#desenvolvimento",
    image: "/service-machining-center.jpg",
    alt: "Centro de usinagem em operação",
    title: "Desenvolvimento sob medida",
    copy: "Peças e modelos para fundição feitos conforme a necessidade.",
  },
];

export default async function HomePage() {
  const categorySlugs = machineCards.map((machine) => machine.slug);
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isHighlighted: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    }),
  ]);
  const categoryCounts = new Map(
    categories.map((category) => [category.slug, category._count.products])
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.17em] text-accent sm:text-sm">
              Peças de reposição <span className="text-steel">•</span> Linha John Deere
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.86] tracking-[-0.045em] text-fg sm:text-6xl lg:text-7xl xl:text-8xl">
              Peças usinadas para sua máquina não parar
            </h1>
            <div className="hazard-stripe mt-6 w-24" aria-hidden="true" />
            <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
              Peças similares e compatíveis para máquinas agrícolas, produzidas com
              usinagem CNC, controle dimensional e atendimento direto da equipe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pecas"
                className="inline-flex min-h-12 items-center justify-center bg-accent px-6 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Ver catálogo
              </Link>
              <Link
                href={whatsappLink("Olá! Gostaria de falar com a equipe da ACB.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center border border-line px-6 text-sm font-semibold text-fg transition-colors hover:border-steel/50 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Falar no WhatsApp
              </Link>
            </div>
            <p className="mt-5 font-mono text-xs text-muted">{SITE.city}</p>
          </div>

          <div className="relative mx-auto aspect-[1.05] w-full max-w-[580px]">
            <div
              aria-hidden="true"
              className="absolute inset-[14%] rounded-full bg-accent/10 blur-3xl"
            />
            <div className="absolute left-[2%] top-[9%] h-[60%] w-[59%] border border-line bg-surface/70 p-2 shadow-2xl shadow-black/40 sm:p-4">
              <div className="product-stage relative h-full w-full">
                <Image
                  src="/catalog/colheitadeira/de20100.png"
                  alt="Caixa do elevador para colheitadeira"
                  fill
                  priority
                  sizes="(max-width: 767px) 55vw, 30vw"
                  className="object-contain p-3 drop-shadow-2xl"
                />
              </div>
              <span className="absolute bottom-3 left-3 border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] text-steel sm:bottom-5 sm:left-5">
                DE20100
              </span>
            </div>
            <div className="absolute right-[1%] top-[5%] h-[42%] w-[38%] border border-line bg-surface/80 p-2 shadow-xl shadow-black/30 sm:p-3">
              <div className="product-stage relative h-full w-full">
                <Image
                  src="/catalog/colheitadeira/de21086.png"
                  alt="Caixa de acionamento da navalha para colheitadeira"
                  fill
                  priority
                  sizes="(max-width: 767px) 36vw, 22vw"
                  className="object-contain p-3 drop-shadow-2xl"
                />
              </div>
              <span className="absolute bottom-2 left-2 border border-line bg-bg/90 px-2 py-1 font-mono text-[9px] text-steel sm:bottom-3 sm:left-3 sm:text-[10px]">
                DE21086
              </span>
            </div>
            <div className="absolute bottom-[2%] right-[7%] h-[50%] w-[53%] border border-line bg-surface/90 p-2 shadow-2xl shadow-black/50 sm:p-4">
              <div className="product-stage relative h-full w-full">
                <Image
                  src="/catalog/pulverizador/an207684.png"
                  alt="Barra da suspensão para pulverizador"
                  fill
                  priority
                  sizes="(max-width: 767px) 50vw, 28vw"
                  className="object-contain p-3 drop-shadow-2xl"
                />
              </div>
              <span className="absolute bottom-2 left-2 border border-line bg-bg/90 px-2 py-1 font-mono text-[9px] text-steel sm:bottom-4 sm:left-4 sm:text-[10px]">
                AN207684
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Indicadores" className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-line px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["160+", "peças catalogadas"],
            ["3", "linhas de máquinas"],
            ["CNC", "usinagem própria"],
            [SITE.city, "Localização"],
          ].map(([value, label]) => (
            <div key={label} className="bg-surface px-3 py-5 sm:px-5 sm:py-6">
              <p
                className={`font-display font-bold uppercase leading-none text-fg ${
                  value === SITE.city ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
                }`}
              >
                {value}
              </p>
              <p className="mt-2 text-xs text-muted sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionTitle
          kicker="Catálogo agrícola"
          title="Navegue por máquina"
          description="Encontre componentes por linha de máquina e consulte a disponibilidade pelo código."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machineCards.map((machine) => (
            <MachineCard
              key={machine.slug}
              {...machine}
              count={categoryCounts.get(machine.slug) ?? 0}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              kicker="Seleção da equipe"
              title="Peças em destaque"
              description="Alguns itens do catálogo para encontrar rapidamente."
            />
            <Link
              href="/pecas"
              className="inline-flex min-h-10 items-center border border-line px-4 text-sm text-steel transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver todas as peças <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-line bg-bg p-6 text-sm text-muted">
              O catálogo está sendo atualizado. Fale com a equipe para consultar uma peça.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionTitle
          kicker="Atendimento direto"
          title="Como funciona"
          description="Da identificação da peça ao retorno da equipe, o processo é simples."
        />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Encontre a peça", "Busque pelo código ou pelo nome no catálogo."],
            ["02", "Solicite orçamento", "Envie sua necessidade para nossa equipe."],
            ["03", "Receba retorno", "Respondemos pelo WhatsApp e enviamos para todo o Brasil."],
          ].map(([number, title, description]) => (
            <li key={number} className="border border-line bg-surface p-5 sm:p-6">
              <span className="font-mono text-sm text-accent">{number}</span>
              <h3 className="mt-5 font-display text-2xl font-bold uppercase text-fg">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle
            kicker="Estrutura industrial"
            title="Serviços e capacidade"
            description="Recursos para fabricar, recuperar e desenvolver componentes conforme o projeto."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {serviceTeasers.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group border border-line bg-bg transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover brightness-75 transition duration-200 group-hover:brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold uppercase text-fg">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{service.copy}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="hazard-stripe h-1 w-full" aria-hidden="true" />
        <div className="mt-4 grid gap-6 border border-line bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Atendimento direto
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-fg sm:text-4xl">
              Precisa de uma peça específica?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Envie o código, desenho ou amostra para conversar com nossa equipe.
            </p>
          </div>
          <Link
            href={whatsappLink("Olá! Quero consultar uma peça para minha máquina.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Falar no WhatsApp
          </Link>
        </div>
      </section>
    </main>
  );
}
