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

function FilterLinks({
  categories,
  selectedCategory,
  query,
  showCounts,
}: {
  categories: {
    slug: string;
    name: string;
    _count: { products: number };
  }[];
  selectedCategory?: string;
  query?: string;
  showCounts: boolean;
}) {
  return (
    <ul className="mt-3 space-y-1">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={catalogHref({ query, category: category.slug })}
            aria-current={selectedCategory === category.slug ? "page" : undefined}
            className={`flex min-h-10 items-center justify-between px-3 text-sm transition-colors ${
              selectedCategory === category.slug
                ? "bg-surface-2 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            <span>{category.name}</span>
            {showCounts ? (
              <span className="font-mono text-xs">{category._count.products}</span>
            ) : null}
          </Link>
        </li>
      ))}
      <li className="border-t border-line pt-1">
        <Link
          href={catalogHref({ query })}
          aria-current={!selectedCategory ? "page" : undefined}
          className={`flex min-h-10 items-center justify-between px-3 text-sm transition-colors ${
            !selectedCategory
              ? "bg-surface-2 text-accent"
              : "text-muted hover:bg-surface-2 hover:text-fg"
          }`}
        >
          Todas
          {showCounts ? <span className="font-mono text-xs">{categories.reduce((n, c) => n + c._count.products, 0)}</span> : null}
        </Link>
      </li>
    </ul>
  );
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

      <div className="mt-8 border border-line bg-surface p-4 lg:hidden">
        <form action="/pecas" method="get" role="search" className="flex gap-2">
          {selectedCategory ? (
            <input type="hidden" name="categoria" value={selectedCategory} />
          ) : null}
          <label htmlFor="catalog-search-mobile" className="sr-only">
            Buscar peças
          </label>
          <input
            id="catalog-search-mobile"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="Buscar por código ou nome"
            className="min-h-11 min-w-0 flex-1 border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            className="min-h-11 bg-accent px-4 text-sm font-bold text-accent-fg"
          >
            Buscar
          </button>
        </form>
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer text-sm text-steel">Filtrar por máquina</summary>
          <FilterLinks
            categories={categories}
            selectedCategory={selectedCategory}
            query={query}
            showCounts
          />
        </details>
        <Link
          href="/pecas"
          className="mt-3 inline-flex text-xs text-muted underline decoration-line underline-offset-4 hover:text-accent"
        >
          Limpar filtros
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 border border-line bg-surface p-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Filtrar catálogo
            </h2>
            <form action="/pecas" method="get" role="search" className="mt-4">
              {selectedCategory ? (
                <input type="hidden" name="categoria" value={selectedCategory} />
              ) : null}
              <label htmlFor="catalog-search" className="text-xs text-muted">
                Busca
              </label>
              <input
                id="catalog-search"
                name="q"
                type="search"
                defaultValue={query ?? ""}
                placeholder="Código ou nome"
                className="mt-2 min-h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
              />
              <button
                type="submit"
                className="mt-2 min-h-10 w-full border border-line text-xs font-semibold text-steel transition-colors hover:border-accent/50 hover:text-accent"
              >
                Buscar
              </button>
            </form>
            <div className="mt-5 border-t border-line pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-steel">
                Máquinas
              </h3>
              <FilterLinks
                categories={categories}
                selectedCategory={selectedCategory}
                query={query}
                showCounts
              />
            </div>
            <Link
              href="/pecas"
              className="mt-4 inline-flex text-xs text-muted underline decoration-line underline-offset-4 hover:text-accent"
            >
              Limpar filtros
            </Link>
          </div>
        </aside>

        <section aria-labelledby="catalog-results-heading">
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
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </main>
  );
}
