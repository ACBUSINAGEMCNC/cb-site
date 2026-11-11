"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importCatalog, type CatalogImportResult } from "@/lib/catalogImport";
import { requireAdminUser } from "@/lib/adminAuth";

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
    redirect(`/admin/importar?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/pecas");
  revalidatePath("/admin/categorias");

  const params = new URLSearchParams({
    done: "1",
    categories: String(result.categories),
    products: String(result.products),
    images: String(result.images),
  });
  if (result.deleted) {
    params.set("deletedCategories", String(result.deleted.categories));
    params.set("deletedProducts", String(result.deleted.products));
    params.set("deletedImages", String(result.deleted.images));
  }
  redirect(`/admin/importar?${params.toString()}`);
}
