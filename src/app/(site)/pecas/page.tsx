import type { Prisma } from "@prisma/client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type SearchParams = {
  categoria?: string | string[];
  q?: string | string[];
  page?: string | string[];
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function catalogHref({
  query,
  category,
  page,
}: {
  query?: string;
  category?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("categoria", category);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/pecas?${search}` : "/pecas";
}

function categoryPillClass(active: boolean) {
  return `inline-flex min-h-9 items-center gap-1.5 border px-3 text-xs whitespace-nowrap transition-colors ${
    active
      ? "border-accent/60 bg-accent/15 text-accent"
      : "border-line text-muted hover:border-accent/50 hover:text-fg"
  }`;
}

export default async function PecasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() || undefined;
  const selectedCategory = firstValue(params.categoria) || undefined;
  const requestedPage = Number(firstValue(params.page) ?? 1);
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(selectedCategory ? { category: { slug: selectedCategory } } : {}),
    ...(query
      ? {
          OR: [
            { internalCode: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { application: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionTitle
        kicker="Peças similares e compatíveis"
        title="Catálogo de peças"
        description="Busque por código, nome ou aplicação e encontre a linha de máquina."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2 border border-line bg-surface p-3">
        <form
          action="/pecas"
          method="get"
          role="search"
          className="flex min-w-[240px] flex-1 items-center gap-2"
        >
          {selectedCategory ? (
            <input type="hidden" name="categoria" value={selectedCategory} />
          ) : null}
          <label htmlFor="catalog-search" className="sr-only">
            Buscar peças
          </label>
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="Buscar por código, nome ou aplicação"
            className="min-h-10 min-w-0 flex-1 border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            className="min-h-10 shrink-0 bg-accent px-4 text-sm font-bold text-accent-fg"
          >
            Buscar
          </button>
        </form>

        <nav
          aria-label="Filtrar por máquina"
          className="flex flex-wrap items-center gap-1.5"
        >
          <Link
            href={catalogHref({ query })}
            aria-current={!selectedCategory ? "page" : undefined}
            className={categoryPillClass(!selectedCategory)}
          >
            Todas
            <span className="font-mono text-[10px] opacity-80">
              {categories.reduce((n, c) => n + c._count.products, 0)}
            </span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={catalogHref({ query, category: category.slug })}
              aria-current={
                selectedCategory === category.slug ? "page" : undefined
              }
              className={categoryPillClass(selectedCategory === category.slug)}
            >
              {category.name}
              <span className="font-mono text-[10px] opacity-80">
                {category._count.products}
              </span>
            </Link>
          ))}
          {query || selectedCategory ? (
            <Link
              href="/pecas"
              className="inline-flex min-h-9 items-center px-2 text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Limpar
            </Link>
          ) : null}
        </nav>
      </div>

      <section aria-labelledby="catalog-results-heading" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2
                id="catalog-results-heading"
                className="font-display text-2xl font-bold uppercase text-fg"
              >
                Peças disponíveis
              </h2>
              <p className="mt-1 text-xs text-muted">
                {total} {total === 1 ? "peça encontrada" : "peças encontradas"}
              </p>
            </div>
            {(query || selectedCategory) ? (
              <p className="font-mono text-xs text-steel">
                {selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name : ""}
                {selectedCategory && query ? " / " : ""}
                {query ? `“${query}”` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex items-start gap-3 border border-line bg-surface px-4 py-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            >
              <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M12 10.8v5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="12" cy="7.8" r="1.1" fill="currentColor" />
            </svg>
            <p className="font-mono text-xs leading-5 text-muted">
              Dica: adicione as peças ao orçamento e envie tudo de uma vez pelo
              WhatsApp. Sem cadastro e sem preço exibido — retornamos com
              disponibilidade e valores.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-line bg-surface p-6 sm:p-8">
              <h3 className="font-display text-2xl font-bold uppercase text-fg">
                Não encontrou a peça?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Fabricamos sob desenho ou amostra. Fale com a equipe para consultar uma
                solução compatível.
              </p>
              <Link
                href={whatsappLink("Olá! Não encontrei uma peça no catálogo. Fabricam sob desenho ou amostra?")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm font-bold text-accent-fg"
              >
                Consultar pelo WhatsApp
              </Link>
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Paginação do catálogo"
              className="mt-8 flex items-center justify-between border-t border-line pt-5"
            >
              {safePage > 1 ? (
                <Link
                  href={catalogHref({
                    query,
                    category: selectedCategory,
                    page: safePage - 1,
                  })}
                  className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
                >
                  Anterior
                </Link>
              ) : (
                <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/50">
                  Anterior
                </span>
              )}
              <span className="font-mono text-xs text-muted">
                Página {safePage} de {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link
                  href={catalogHref({
                    query,
                    category: selectedCategory,
                    page: safePage + 1,
                  })}
                  className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
                >
                  Próxima
                </Link>
              ) : (
                <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/50">
                  Próxima
                </span>
              )}
            </nav>
          ) : null}
      </section>
    </main>
  );
}
