import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  const [categories, products, images] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.product.findMany({
      orderBy: { id: "asc" },
      include: { category: { select: { slug: true } } },
    }),
    prisma.productImage.findMany({
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
      include: { product: { select: { slug: true } } },
    }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    products: products.map(({ category, ...product }) => ({
      ...product,
      categorySlug: category.slug,
    })),
    images: images.map(({ product, ...image }) => ({
      ...image,
      productSlug: product.slug,
    })),
  };

  const date = payload.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-catalogo-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
