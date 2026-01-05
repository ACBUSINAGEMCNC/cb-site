import { NextResponse } from "next/server";
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

  await prisma.productImage.updateMany({
    where: { productId },
    data: { isPrimary: false },
  });

  await prisma.productImage.update({
    where: { id: imgId },
    data: { isPrimary: true },
  });

  return NextResponse.json({ ok: true });
}
