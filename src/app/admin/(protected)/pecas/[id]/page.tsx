import { notFound } from "next/navigation";
import Link from "next/link";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import ProductForm from "@/components/admin/ProductForm";
import ProductImagesManager from "@/components/admin/ProductImagesManager";
import {
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/(protected)/pecas/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [product, categories, query] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    searchParams,
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            {product.internalCode ?? product.slug}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Editar peça
          </h1>
        </div>
        <Link href="/admin/pecas" className="text-sm text-muted hover:text-accent">
          Voltar à lista
        </Link>
      </div>

      {query.created === "1" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          Peça criada — agora adicione as fotos.
        </p>
      ) : null}
      {query.saved === "1" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          Alterações salvas.
        </p>
      ) : null}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <section>
          <ProductForm
            action={updateProductAction.bind(null, product.id)}
            categories={categories}
            values={{
              internalCode: product.internalCode,
              name: product.name,
              categoryId: product.categoryId,
              application: product.application,
              description: product.description,
              material: product.material,
              treatment: product.treatment,
              isHighlighted: product.isHighlighted,
              isActive: product.isActive,
              sortOrder: product.sortOrder,
            }}
            submitLabel="Salvar alterações"
            error={query.error}
          />
        </section>

        <ProductImagesManager
          productId={product.id}
          initialImages={product.images}
        />
      </div>

      <section className="mt-10 border border-red-400/30 bg-red-400/5 p-5 sm:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-red-200">
          Zona de perigo
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase text-fg">
          Excluir peça
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          A peça e suas imagens cadastradas serão removidas. Imagens do catálogo público
          não serão apagadas do Storage.
        </p>
        <form action={deleteProductAction.bind(null, product.id)} className="mt-4">
          <ConfirmDeleteButton
            confirmation={`Excluir ${product.internalCode ?? product.name}? Esta ação não pode ser desfeita.`}
            className="min-h-10 border border-red-400/40 px-4 text-sm text-red-200 transition-colors hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
          >
            Excluir peça
          </ConfirmDeleteButton>
        </form>
      </section>
    </div>
  );
}
