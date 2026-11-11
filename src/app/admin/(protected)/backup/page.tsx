import { importCatalogAction, restoreBackupAction } from "@/app/admin/(protected)/backup/actions";
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

export default async function AdminBackupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Segurança dos dados
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
          Centro de backup
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Exporte todo o catálogo para um arquivo JSON, restaure um backup salvo
          ou reaplique as peças originais dos catálogos PDF.
        </p>
      </div>

      {params.error ? (
        <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}

      {params.done === "restored" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          Backup restaurado: {params.products} peças recriadas.
        </p>
      ) : null}

      {params.done === "imported" ? (
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

      <section className="mt-7 border border-line bg-surface p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Exportar backup
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">
          Baixar catálogo completo
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Baixa um arquivo JSON com todas as categorias, peças e imagens do
          catálogo atual — guarde-o para restaurar depois em caso de problema.
        </p>
        <a
          href="/api/admin/backup"
          download
          className="mt-5 inline-flex min-h-12 items-center bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90"
        >
          Baixar backup (.json)
        </a>
      </section>

      <section className="mt-6 border border-line bg-surface p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Restaurar backup
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">
          Enviar arquivo de backup
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Substitui todo o catálogo pelo conteúdo do arquivo. Os registros são
          recriados — os códigos internos (IDs) podem mudar, mas nomes, slugs,
          ordem, destaque e demais campos são preservados.
        </p>
        <form action={restoreBackupAction} className="mt-5">
          <label className="block text-xs text-muted">
            Arquivo de backup (.json)*
            <input
              type="file"
              name="file"
              accept="application/json,.json"
              required
              className="mt-2 block w-full border border-line bg-bg px-3 py-2 text-sm text-fg file:mr-3 file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-fg"
            />
          </label>
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-steel">
            <input
              type="checkbox"
              name="confirm"
              required
              className="mt-1 h-4 w-4 shrink-0 accent-accent"
            />
            <span>Substituir o catálogo atual pelos dados do backup</span>
          </label>
          <button
            type="submit"
            className="mt-5 min-h-12 w-full border border-accent bg-transparent px-5 text-sm font-bold text-accent transition-colors hover:bg-accent/10 sm:w-auto"
          >
            Restaurar backup
          </button>
        </form>
      </section>

      <section className="mt-6 border border-line bg-surface p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Catálogo original (PDFs)
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">
          Reimportar peças dos catálogos
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Reaplica as peças dos catálogos PDF — para uso em manutenção; peças
          criadas manualmente são preservadas se não marcar &quot;substituir&quot;.
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

        <form action={importCatalogAction} className="mt-6 border-t border-line pt-6">
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
