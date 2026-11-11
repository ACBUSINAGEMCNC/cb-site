import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";
import { ensureBucket, STORAGE_BUCKET } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function DELETE(
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

  if (image.storagePath) {
    try {
      const supabase = await ensureBucket();
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([image.storagePath]);
      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao remover imagem do Storage.";
      return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.productImage.delete({ where: { id: imgId } });
    if (image.isPrimary) {
      const nextImage = await transaction.productImage.findFirst({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      if (nextImage) {
        await transaction.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return NextResponse.json({ ok: true, images });
}
