"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function errorRedirect(message: string): never {
  redirect(`/admin/categorias?error=${encodeURIComponent(message)}`);
}

async function uniqueCategorySlug(name: string, exceptId?: number) {
  const base = slugify(name) || "categoria";
  let index = 1;
  while (true) {
    const slug = index === 1 ? base : `${base}-${index}`;
    const existing = await prisma.category.findFirst({
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

function readFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const order = Number(formData.get("sortOrder") ?? 0);
  return {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    sortOrder: Number.isFinite(order) ? Math.trunc(order) : 0,
  };
}

export async function createCategoryAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const fields = readFields(formData);
  if (!fields.name) errorRedirect("Informe o nome da categoria.");
  const slug = await uniqueCategorySlug(fields.name);
  await prisma.category.create({ data: { ...fields, slug } });
  revalidateCatalog();
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?saved=1");
}

export async function updateCategoryAction(
  categoryId: number,
  formData: FormData
) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const fields = readFields(formData);
  if (!fields.name) errorRedirect("Informe o nome da categoria.");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) errorRedirect("Categoria não encontrada.");

  const slug = await uniqueCategorySlug(fields.name, categoryId);
  await prisma.category.update({
    where: { id: categoryId },
    data: { ...fields, slug },
  });
  revalidateCatalog();
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/pecas");
  redirect("/admin/categorias?saved=1");
}

export async function deleteCategoryAction(categoryId: number) {
  if (!(await requireAdminUser())) redirect("/admin/login");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { products: true } } },
  });
  if (!category) errorRedirect("Categoria não encontrada.");
  if (category._count.products > 0) {
    errorRedirect(
      `Não é possível excluir ${category.name}: há ${category._count.products} peças vinculadas.`
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidateCatalog();
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?deleted=1");
}
