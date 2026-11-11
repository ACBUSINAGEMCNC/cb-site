import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, imageId } = await params;
  const productId = Number(id);
  const imgId = Number(imageId);

  if (!productId || !imgId) return NextResponse.json({ ok: false }, { status: 400 });

  const image = await prisma.productImage.findFirst({
    where: { id: imgId, productId },
  });
  if (!image) {
    return NextResponse.json({ ok: false, error: "Imagem não encontrada." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: imgId },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ ok: true, images });
}
