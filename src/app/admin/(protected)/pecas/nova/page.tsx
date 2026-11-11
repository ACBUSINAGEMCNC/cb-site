import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createProductAction } from "@/app/admin/(protected)/pecas/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [categories, params] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    searchParams,
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Catálogo
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
            Nova peça
          </h1>
        </div>
        <Link href="/admin/pecas" className="text-sm text-muted hover:text-accent">
          Voltar à lista
        </Link>
      </div>

      <div className="mt-6">
        <ProductForm
          action={createProductAction}
          categories={categories}
          submitLabel="Criar peça"
          error={params.error}
        />
      </div>
      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          <Link
            href="/admin/categorias"
            className="text-accent underline underline-offset-4"
          >
            Cadastre uma categoria
          </Link>{" "}
          antes de criar peças.
        </p>
      ) : null}
    </div>
  );
}
