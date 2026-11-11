import Link from "next/link";
import { importCatalogAction } from "@/app/admin/(protected)/importar/actions";
import { CATALOG_SUMMARY } from "@/lib/catalogImport";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SearchParams = {
  done?: string;
  categories?: string;
  products?: string;
  images?: string;
  deletedCategories?: string;
  deletedProducts?: string;
  deletedImages?: string;
  error?: string;
};

const totalProducts = CATALOG_SUMMARY.reduce(
  (total, catalog) => total + catalog.products,
  0
);

export default async function AdminImportCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Carga inicial
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Importar catálogo
          </h1>
        </div>
        <Link href="/admin/pecas" className="text-sm text-muted hover:text-accent">
          Voltar às peças
        </Link>
      </div>

      <section className="mt-6 border border-line bg-surface p-5 sm:p-7">
        <p className="max-w-2xl text-sm leading-6 text-muted">
          Importa as peças dos três catálogos PDF a partir dos dados já extraídos. A
          operação cria ou atualiza categorias e produtos pelo slug, e substitui as
          imagens de cada produto pelas imagens locais do catálogo.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {CATALOG_SUMMARY.map((catalog) => (
            <div key={catalog.slug} className="border border-line bg-bg p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {catalog.name}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-fg">
                {catalog.products}
              </p>
              <p className="text-xs text-muted">peças no JSON</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-xs text-steel">
          Total nos arquivos: {totalProducts} peças
        </p>

        {params.error ? (
          <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
            {params.error}
          </p>
        ) : null}

        {params.done === "1" ? (
          <div role="status" className="mt-5 border border-green/40 bg-green/10 p-4 text-sm text-fg">
            <p className="font-semibold">Importação concluída.</p>
            <p className="mt-1 text-muted">
              {params.categories} categorias, {params.products} produtos e {params.images} imagens.
            </p>
            {params.deletedProducts ? (
              <p className="mt-2 text-xs text-muted">
                Substituição removeu {params.deletedProducts} produtos,{" "}
                {params.deletedImages ?? "0"} imagens e {params.deletedCategories ?? "0"} categorias.
              </p>
            ) : null}
          </div>
        ) : null}

        <form action={importCatalogAction} className="mt-7 border-t border-line pt-6">
          <label className="flex items-start gap-3 text-sm leading-6 text-steel">
            <input
              type="checkbox"
              name="replace"
              className="mt-1 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              Substituir todo o catálogo atual (apaga peças, fotos e categorias existentes)
            </span>
          </label>
          <button
            type="submit"
            className="mt-5 min-h-12 w-full bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 sm:w-auto"
          >
            Importar {totalProducts} peças
          </button>
        </form>
      </section>
    </div>
  );
}
