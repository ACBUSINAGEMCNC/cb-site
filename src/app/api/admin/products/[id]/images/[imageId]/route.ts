import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";

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

  const img = await prisma.productImage.findUnique({ where: { id: imgId } });
  if (!img) return NextResponse.json({ ok: true });

  await prisma.productImage.delete({ where: { id: imgId } });

  // Se for arquivo local em /product-images, tenta remover do disco
  if (img.url.startsWith(`/product-images/${productId}/`)) {
    const rel = img.url.replace(/^\//, "");
    const fileOnDisk = path.join(process.cwd(), "public", rel);
    await fs.unlink(fileOnDisk).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
