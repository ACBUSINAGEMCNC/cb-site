import Link from "next/link";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/(protected)/categorias/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = {
  saved?: string;
  deleted?: string;
  error?: string;
};

const fieldClassName =
  "mt-2 min-h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [categories, params] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    searchParams,
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Organização do catálogo
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Categorias
          </h1>
        </div>
        <Link href="/admin/pecas" className="text-sm text-muted hover:text-accent">
          Ver peças
        </Link>
      </div>

      {params.error ? (
        <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      {params.saved === "1" || params.deleted === "1" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          {params.deleted === "1" ? "Categoria excluída." : "Categoria salva."}
        </p>
      ) : null}

      <section className="mt-7 border border-line bg-surface p-5 sm:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Nova categoria
        </p>
        <form action={createCategoryAction} className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="text-xs text-muted md:col-span-1">
            Nome*
            <input name="name" required className={fieldClassName} />
          </label>
          <label className="text-xs text-muted">
            Ordem
            <input name="sortOrder" type="number" defaultValue={0} className={fieldClassName} />
          </label>
          <label className="text-xs text-muted md:col-span-2">
            Descrição
            <input name="description" className={fieldClassName} />
          </label>
          <div className="md:col-span-4">
            <p className="text-[11px] text-muted">O slug será gerado automaticamente pelo nome.</p>
            <button
              type="submit"
              className="mt-3 min-h-10 bg-accent px-4 text-sm font-bold text-accent-fg hover:bg-accent/90"
            >
              Criar categoria
            </button>
          </div>
        </form>
      </section>

      <section className="mt-7 space-y-3" aria-label="Categorias cadastradas">
        {categories.map((category) => (
          <article
            key={category.id}
            className="grid gap-4 border border-line bg-surface p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          >
            <form
              action={updateCategoryAction.bind(null, category.id)}
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_8rem_minmax(16rem,1.5fr)]"
            >
              <label className="text-xs text-muted">
                Nome
                <input name="name" required defaultValue={category.name} className={fieldClassName} />
              </label>
              <label className="text-xs text-muted">
                Ordem
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={category.sortOrder}
                  className={fieldClassName}
                />
              </label>
              <label className="text-xs text-muted sm:col-span-2 xl:col-span-1">
                Descrição
                <input
                  name="description"
                  defaultValue={category.description ?? ""}
                  className={fieldClassName}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-3">
                <span className="font-mono text-[10px] text-muted">/{category.slug}</span>
                <span className="text-xs text-steel">
                  {category._count.products} produtos vinculados
                </span>
                <button
                  type="submit"
                  className="min-h-9 border border-line px-3 text-xs text-fg hover:border-accent/50 hover:text-accent"
                >
                  Salvar
                </button>
              </div>
            </form>

            <div className="flex items-center border-t border-line pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              {category._count.products === 0 ? (
                <form action={deleteCategoryAction.bind(null, category.id)}>
                  <ConfirmDeleteButton
                    confirmation={`Excluir a categoria ${category.name}?`}
                    className="min-h-9 border border-red-400/30 px-3 text-xs text-red-200 hover:bg-red-400/10"
                  >
                    Excluir
                  </ConfirmDeleteButton>
                </form>
              ) : (
                <span className="text-xs text-muted">
                  Exclua ou mova os produtos antes de remover.
                </span>
              )}
            </div>
          </article>
        ))}
        {categories.length === 0 ? (
          <p className="border border-line bg-surface p-5 text-sm text-muted">
            Nenhuma categoria cadastrada.
          </p>
        ) : null}
      </section>
    </div>
  );
}
