import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { getProductBySlug } from "@/lib/catalog-data";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function splitModels(application: string) {
  return application
    .split(/\s*(?:\/|,|;|\be\b)\s*/i)
    .map((model) => model.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Peça não encontrada" };
  const code = product.internalCode ?? product.slug.toUpperCase();
  return {
    title: `${code} ${product.name}`,
    description: `${product.name} — peça similar/compatível para ${product.category.name}.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 4,
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
  });
  const code = product.internalCode ?? product.slug.toUpperCase();
  const quoteLink = whatsappLink(
    `Olá! Quero orçamento da peça ${code} - ${product.name}`
  );
  const models = product.application ? splitModels(product.application) : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Catálogo", href: "/pecas" },
          {
            label: product.category.name,
            href: `/pecas?categoria=${product.category.slug}`,
          },
          { label: code },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images}
          alt={`${product.name} — ${code}`}
        />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-steel">
              {code}
            </span>
            <span className="border border-accent/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
              {product.category.name}
            </span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.035em] text-fg sm:text-5xl">
            {product.name}
          </h1>

          {models.length > 0 ? (
            <section className="mt-7">
              <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Modelos compatíveis
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {models.map((model, index) => (
                  <li
                    key={`${model}-${index}`}
                    className="border border-line bg-surface px-3 py-2 text-xs text-steel"
                  >
                    {model}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.description ? (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-muted">
              {product.description}
            </p>
          ) : null}

          {product.material || product.treatment ? (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.material ? (
                <div className="border border-line bg-surface p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Material
                  </dt>
                  <dd className="mt-2 text-sm text-fg">{product.material}</dd>
                </div>
              ) : null}
              {product.treatment ? (
                <div className="border border-line bg-surface p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Tratamento
                  </dt>
                  <dd className="mt-2 text-sm text-fg">{product.treatment}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-8 border border-line bg-surface p-5 lg:sticky lg:top-32">
            <p className="font-display text-2xl font-bold uppercase text-fg">
              Solicitar orçamento desta peça
            </p>
            <p className="mt-2 text-sm text-muted">
              Informe quantidade e aplicação para receber um retorno.
            </p>
            <Link
              href={quoteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Solicitar no WhatsApp
            </Link>
            <p className="mt-3 text-center font-mono text-[10px] text-muted">
              Sem compromisso <span aria-hidden="true">•</span> Retorno rápido
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                Mais do catálogo
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase text-fg">
                Outras peças de {product.category.name}
              </h2>
            </div>
            <Link
              href={`/pecas?categoria=${product.category.slug}`}
              className="text-sm text-steel underline decoration-line underline-offset-4 hover:text-accent"
            >
              Ver categoria
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
