"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importCatalog, type CatalogImportResult } from "@/lib/catalogImport";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

function errorRedirect(message: string): never {
  redirect(`/admin/backup?error=${encodeURIComponent(message)}`);
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/pecas");
  revalidatePath("/admin/categorias");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function int(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function optionalDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type ParsedBackup = {
  categories: Record<string, unknown>[];
  products: Record<string, unknown>[];
  images: Record<string, unknown>[];
};

function parseBackup(data: unknown): ParsedBackup {
  const root = asRecord(data);
  if (!root) errorRedirect("Arquivo inválido: não é um objeto JSON.");
  const { categories, products, images } = root as Record<string, unknown>;

  for (const [key, value] of Object.entries({ categories, products, images })) {
    if (!Array.isArray(value)) {
      errorRedirect(`Arquivo inválido: "${key}" precisa ser uma lista.`);
    }
  }

  const categoryItems = (categories as unknown[]).map(asRecord);
  const productItems = (products as unknown[]).map(asRecord);
  const imageItems = (images as unknown[]).map(asRecord);

  if (categoryItems.some((item) => !item || !str(item.slug) || !str(item.name))) {
    errorRedirect(
      "Arquivo inválido: toda categoria precisa de slug e nome."
    );
  }
  if (
    productItems.some(
      (item) =>
        !item ||
        !str(item.slug) ||
        !str(item.name) ||
        ("internalCode" in item &&
          item.internalCode !== null &&
          typeof item.internalCode !== "string")
    )
  ) {
    errorRedirect(
      "Arquivo inválido: toda peça precisa de slug, nome e código interno (internalCode) válidos."
    );
  }
  if (imageItems.some((item) => !item || !str(item.url))) {
    errorRedirect("Arquivo inválido: toda imagem precisa de url.");
  }

  const categorySlugs = new Set<string>();
  for (const item of categoryItems) {
    const slug = str(item!.slug)!;
    if (categorySlugs.has(slug)) {
      errorRedirect(`Arquivo inválido: slug de categoria duplicado "${slug}".`);
    }
    categorySlugs.add(slug);
  }
  const productSlugs = new Set<string>();
  for (const item of productItems) {
    const slug = str(item!.slug)!;
    if (productSlugs.has(slug)) {
      errorRedirect(`Arquivo inválido: slug de peça duplicado "${slug}".`);
    }
    productSlugs.add(slug);
  }

  return {
    categories: categoryItems as Record<string, unknown>[],
    products: productItems as Record<string, unknown>[],
    images: imageItems as Record<string, unknown>[],
  };
}

export async function restoreBackupAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");

  if (formData.get("confirm") !== "on") {
    errorRedirect("Marque a confirmação para substituir o catálogo atual.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    errorRedirect("Selecione o arquivo .json do backup.");
  }
  if (file.size > 50 * 1024 * 1024) {
    errorRedirect("Arquivo muito grande (máximo 50 MB).");
  }

  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    errorRedirect("Não foi possível ler o arquivo: JSON inválido.");
  }

  const backup = parseBackup(data);

  let restoredProducts = 0;
  try {
    restoredProducts = await prisma.$transaction(
      async (tx) => {
        await tx.productImage.deleteMany();
        await tx.product.deleteMany();
        await tx.category.deleteMany();

        const categories = await tx.category.createManyAndReturn({
          data: backup.categories.map((item) => ({
            name: str(item.name)!,
            slug: str(item.slug)!,
            description: str(item.description),
            imageUrl: str(item.imageUrl),
            sortOrder: int(item.sortOrder, 0),
          })),
        });
        const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
        const categoryByOldId = new Map<number, number>();
        backup.categories.forEach((item) => {
          const oldId = Number(item.id);
          const newId = categoryBySlug.get(str(item.slug)!);
          if (Number.isFinite(oldId) && newId) {
            categoryByOldId.set(oldId, newId);
          }
        });

        const missingCategory = backup.products.find((item) => {
          const slug = str(item.categorySlug);
          if (slug) return !categoryBySlug.has(slug);
          const oldId = Number(item.categoryId);
          return !Number.isFinite(oldId) || !categoryByOldId.has(oldId);
        });
        if (missingCategory) {
          throw new Error(
            `A peça "${str(missingCategory.slug)}" referencia uma categoria ausente no backup.`
          );
        }

        const products = await tx.product.createManyAndReturn({
          data: backup.products.map((item) => {
            const slug = str(item.categorySlug);
            const categoryId = slug
              ? categoryBySlug.get(slug)!
              : categoryByOldId.get(Number(item.categoryId))!;
            const createdAt = optionalDate(item.createdAt);
            return {
              name: str(item.name)!,
              slug: str(item.slug)!,
              internalCode: str(item.internalCode),
              description: str(item.description),
              application: str(item.application),
              material: str(item.material),
              treatment: str(item.treatment),
              isHighlighted: bool(item.isHighlighted, false),
              isActive: bool(item.isActive, true),
              sortOrder: int(item.sortOrder, 0),
              categoryId,
              ...(createdAt ? { createdAt } : {}),
            };
          }),
          select: { id: true, slug: true },
        });
        const productBySlug = new Map(products.map((p) => [p.slug, p.id]));
        const productByOldId = new Map<number, number>();
        backup.products.forEach((item) => {
          const oldId = Number(item.id);
          const newId = productBySlug.get(str(item.slug)!);
          if (Number.isFinite(oldId) && newId) {
            productByOldId.set(oldId, newId);
          }
        });

        const missingProduct = backup.images.find((item) => {
          const slug = str(item.productSlug);
          if (slug) return !productBySlug.has(slug);
          const oldId = Number(item.productId);
          return !Number.isFinite(oldId) || !productByOldId.has(oldId);
        });
        if (missingProduct) {
          throw new Error(
            "Há imagens no backup referenciando uma peça inexistente."
          );
        }

        if (backup.images.length > 0) {
          await tx.productImage.createMany({
            data: backup.images.map((item) => {
              const slug = str(item.productSlug);
              const productId = slug
                ? productBySlug.get(slug)!
                : productByOldId.get(Number(item.productId))!;
              return {
                url: str(item.url)!,
                isPrimary: bool(item.isPrimary, false),
                sortOrder: int(item.sortOrder, 0),
                storagePath: str(item.storagePath),
                productId,
              };
            }),
          });
        }

        return products.length;
      },
      { timeout: 30000, maxWait: 10000 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao restaurar o backup.";
    errorRedirect(`Restauração abortada, nada foi alterado: ${message}`);
  }

  revalidateCatalog();
  revalidatePath("/admin/backup");
  redirect(`/admin/backup?done=restored&products=${restoredProducts}`);
}

export async function importCatalogAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");

  let result: CatalogImportResult;
  try {
    result = await importCatalog({
      replace: formData.get("replace") === "on",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao importar o catálogo.";
    errorRedirect(message);
  }

  revalidateCatalog();

  const params = new URLSearchParams({
    done: "imported",
    categories: String(result.categories),
    products: String(result.products),
    images: String(result.images),
  });
  if (result.deleted) {
    params.set("deletedCategories", String(result.deleted.categories));
    params.set("deletedProducts", String(result.deleted.products));
    params.set("deletedImages", String(result.deleted.images));
  }
  redirect(`/admin/backup?${params.toString()}`);
}
