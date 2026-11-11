"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { ensureBucket, STORAGE_BUCKET } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueProductSlug(code: string, exceptId?: number) {
  const base = slugify(code) || "peca";
  let index = 1;
  while (true) {
    const slug = index === 1 ? base : `${base}-${index}`;
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return slug;
    index += 1;
  }
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
}

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function readProductFields(formData: FormData) {
  const internalCode = String(formData.get("internalCode") ?? "")
    .trim()
    .toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const category = Number.isInteger(categoryId)
    ? await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
    : null;

  if (!internalCode || !name || !category) {
    return null;
  }

  const sortOrderValue = Number(formData.get("sortOrder") ?? 0);
  return {
    internalCode,
    name,
    categoryId: category.id,
    application: String(formData.get("application") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    material: String(formData.get("material") ?? "").trim() || null,
    treatment: String(formData.get("treatment") ?? "").trim() || null,
    isHighlighted: formData.get("isHighlighted") === "on",
    isActive: formData.get("isActive") === "on",
    sortOrder: Number.isFinite(sortOrderValue) ? Math.trunc(sortOrderValue) : 0,
  };
}

export async function createProductAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const values = await readProductFields(formData);
  if (!values) {
    errorRedirect("/admin/pecas/nova", "Informe código, nome e categoria.");
  }

  const slug = await uniqueProductSlug(values.internalCode);
  const product = await prisma.product.create({
    data: {
      ...values,
      slug,
    },
    select: { id: true },
  });

  revalidateCatalog();
  revalidatePath("/admin/pecas");
  redirect(`/admin/pecas/${product.id}?created=1`);
}

export async function updateProductAction(
  productId: number,
  formData: FormData
) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const values = await readProductFields(formData);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, internalCode: true, slug: true },
  });
  if (!product || !values) {
    errorRedirect(`/admin/pecas/${productId}`, "Confira os campos obrigatórios.");
  }

  const slug =
    values.internalCode === product.internalCode
      ? product.slug
      : await uniqueProductSlug(values.internalCode, productId);
  await prisma.product.update({
    where: { id: productId },
    data: { ...values, slug },
  });

  revalidateCatalog();
  revalidatePath("/admin/pecas");
  revalidatePath(`/admin/pecas/${productId}`);
  redirect(`/admin/pecas/${productId}?saved=1`);
}

export async function toggleProductAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const productId = Number(formData.get("productId"));
  const field = String(formData.get("field") ?? "");
  if (!Number.isInteger(productId) || productId <= 0) {
    errorRedirect("/admin/pecas", "Peça inválida.");
  }
  if (field !== "isActive" && field !== "isHighlighted") {
    errorRedirect("/admin/pecas", "Ação inválida.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { isActive: true, isHighlighted: true },
  });
  if (!product) errorRedirect("/admin/pecas", "Peça não encontrada.");

  await prisma.product.update({
    where: { id: productId },
    data:
      field === "isActive"
        ? { isActive: !product.isActive }
        : { isHighlighted: !product.isHighlighted },
  });
  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/admin/pecas");
}

export async function deleteProductAction(productId: number) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { select: { storagePath: true } } },
  });
  if (!product) errorRedirect("/admin/pecas", "Peça não encontrada.");

  const storagePaths = product.images
    .map((image) => image.storagePath)
    .filter((storagePath): storagePath is string => Boolean(storagePath));
  if (storagePaths.length > 0) {
    try {
      const supabase = await ensureBucket();
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(storagePaths);
      if (error) throw error;
    } catch {
      errorRedirect(
        `/admin/pecas/${productId}`,
        "Não foi possível excluir as fotos do Storage; a peça foi mantida."
      );
    }
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidateCatalog();
  revalidatePath("/admin/pecas");
  redirect("/admin/pecas?deleted=1");
}
