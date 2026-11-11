import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import GearIcon from "@/components/GearIcon";
import { toggleProductAction } from "@/app/admin/(protected)/pecas/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type SearchParams = {
  q?: string | string[];
  categoria?: string | string[];
  semFoto?: string | string[];
  page?: string | string[];
  saved?: string | string[];
  deleted?: string | string[];
  error?: string | string[];
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function listHref({
  query,
  categoryId,
  noPhoto,
  page,
}: {
  query?: string;
  categoryId?: string;
  noPhoto: boolean;
  page: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (categoryId) params.set("categoria", categoryId);
  if (noPhoto) params.set("semFoto", "1");
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/pecas?${search}` : "/admin/pecas";
}

function ProductThumbnail({
  image,
  name,
}: {
  image?: string;
  name: string;
}) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-line bg-surface-2">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      ) : (
        <span className="flex h-full items-center justify-center text-muted">
          <GearIcon className="h-6 w-6" />
          <span className="sr-only">Sem foto: {name}</span>
        </span>
      )}
    </div>
  );
}

function ProductBadges({
  isHighlighted,
  isActive,
}: {
  isHighlighted: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {isHighlighted ? (
        <span className="border border-accent/30 px-2 py-1 font-mono text-[9px] uppercase text-accent">
          Destaque
        </span>
      ) : null}
      {!isActive ? (
        <span className="border border-line px-2 py-1 font-mono text-[9px] uppercase text-muted">
          Inativo
        </span>
      ) : null}
    </div>
  );
}

function ToggleForm({
  productId,
  field,
  value,
  label,
}: {
  productId: number;
  field: "isActive" | "isHighlighted";
  value: boolean;
  label: string;
}) {
  return (
    <form action={toggleProductAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        aria-pressed={value}
        className="min-h-8 border border-line px-2 text-[10px] text-steel transition-colors hover:border-accent/50 hover:text-accent"
      >
        {value ? `Remover ${label}` : label}
      </button>
    </form>
  );
}

export default async function AdminPecasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const rawCategoryId = first(params.categoria) ?? "";
  const categoryIdValue = Number(rawCategoryId);
  const categoryId =
    Number.isInteger(categoryIdValue) && categoryIdValue > 0
      ? categoryIdValue
      : undefined;
  const noPhoto = first(params.semFoto) === "1";
  const requestedPage = Number(first(params.page) ?? 1);
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const where: Prisma.ProductWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    ...(noPhoto ? { images: { none: {} } } : {}),
    ...(query
      ? {
          OR: [
            { internalCode: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Catálogo administrativo
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">Peças</h1>
        </div>
        <Link
          href="/admin/pecas/nova"
          className="min-h-11 bg-accent px-5 py-3 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90"
        >
          Nova peça
        </Link>
      </div>

      {first(params.deleted) === "1" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          Peça excluída.
        </p>
      ) : null}
      {first(params.error) ? (
        <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {first(params.error)}
        </p>
      ) : null}

      <form
        action="/admin/pecas"
        method="get"
        className="mt-6 grid gap-3 border border-line bg-surface p-4 md:grid-cols-[minmax(12rem,1fr)_14rem_auto_auto]"
      >
        <label className="text-xs text-muted">
          Busca por código ou nome
          <input
            name="q"
            defaultValue={query}
            className="mt-2 min-h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent"
          />
        </label>
        <label className="text-xs text-muted">
          Categoria
          <select
            name="categoria"
            defaultValue={categoryId ? String(categoryId) : ""}
            className="mt-2 min-h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-2 self-end text-xs text-steel">
          <input
            type="checkbox"
            name="semFoto"
            value="1"
            defaultChecked={noPhoto}
            className="h-4 w-4 accent-accent"
          />
          Sem foto
        </label>
        <button
          type="submit"
          className="min-h-10 self-end border border-line px-4 text-sm text-steel transition-colors hover:border-accent/50 hover:text-accent"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <p>{total} peças encontradas</p>
        <Link href="/admin/categorias" className="hover:text-accent">
          Gerenciar categorias
        </Link>
      </div>

      <div className="mt-3 hidden overflow-hidden border border-line bg-surface lg:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-3 py-3 font-medium">Categoria</th>
              <th className="px-3 py-3 font-medium">Fotos</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductThumbnail
                      image={product.images[0]?.url}
                      name={product.name}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-steel">
                        {product.internalCode ?? "Sem código"}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-fg">
                        {product.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-muted">{product.category.name}</td>
                <td className="px-3 py-3 font-mono text-sm text-steel">
                  {product.images.length}
                </td>
                <td className="px-3 py-3">
                  <ProductBadges
                    isActive={product.isActive}
                    isHighlighted={product.isHighlighted}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <ToggleForm
                      productId={product.id}
                      field="isHighlighted"
                      value={product.isHighlighted}
                      label="Destaque"
                    />
                    <ToggleForm
                      productId={product.id}
                      field="isActive"
                      value={product.isActive}
                      label="Ativar"
                    />
                    <Link
                      href={`/admin/pecas/${product.id}`}
                      className="min-h-8 border border-line px-3 py-2 text-xs text-steel hover:border-accent/50 hover:text-accent"
                    >
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Nenhuma peça encontrada.</p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 lg:hidden">
        {products.map((product) => (
          <article key={product.id} className="border border-line bg-surface p-4">
            <div className="flex gap-3">
              <ProductThumbnail image={product.images[0]?.url} name={product.name} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-steel">
                  {product.internalCode ?? "Sem código"}
                </p>
                <p className="mt-1 text-sm font-semibold text-fg">{product.name}</p>
                <p className="mt-1 text-xs text-muted">{product.category.name}</p>
              </div>
              <span className="font-mono text-xs text-muted">{product.images.length} fotos</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <ProductBadges
                isActive={product.isActive}
                isHighlighted={product.isHighlighted}
              />
              <Link
                href={`/admin/pecas/${product.id}`}
                className="min-h-9 border border-line px-3 py-2 text-xs text-steel hover:border-accent/50 hover:text-accent"
              >
                Editar
              </Link>
            </div>
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <ToggleForm
                productId={product.id}
                field="isHighlighted"
                value={product.isHighlighted}
                label="Destaque"
              />
              <ToggleForm
                productId={product.id}
                field="isActive"
                value={product.isActive}
                label="Ativar"
              />
            </div>
          </article>
        ))}
        {products.length === 0 ? (
          <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
            Nenhuma peça encontrada.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação de peças"
          className="mt-6 flex items-center justify-between border-t border-line pt-4"
        >
          {currentPage > 1 ? (
            <Link
              href={listHref({ query, categoryId: rawCategoryId, noPhoto, page: currentPage - 1 })}
              className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
            >
              Anterior
            </Link>
          ) : (
            <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/40">
              Anterior
            </span>
          )}
          <span className="font-mono text-xs text-muted">
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={listHref({ query, categoryId: rawCategoryId, noPhoto, page: currentPage + 1 })}
              className="min-h-10 border border-line px-4 py-2 text-sm text-steel hover:border-accent/50 hover:text-accent"
            >
              Próxima
            </Link>
          ) : (
            <span className="min-h-10 border border-line px-4 py-2 text-sm text-muted/40">
              Próxima
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
