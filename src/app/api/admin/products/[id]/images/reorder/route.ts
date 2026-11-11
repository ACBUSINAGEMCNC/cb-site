import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ ok: false, error: "Peça inválida." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { orderedIds?: unknown }
    | null;
  const orderedIds = body?.orderedIds;
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.some((imageId) => !Number.isInteger(imageId) || Number(imageId) <= 0) ||
    new Set(orderedIds).size !== orderedIds.length
  ) {
    return NextResponse.json({ ok: false, error: "Lista de imagens inválida." }, { status: 400 });
  }

  const productImages = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const currentIds = new Set(productImages.map((image) => image.id));
  if (
    currentIds.size !== orderedIds.length ||
    orderedIds.some((imageId) => !currentIds.has(Number(imageId)))
  ) {
    return NextResponse.json(
      { ok: false, error: "A lista não corresponde às imagens desta peça." },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    orderedIds.map((imageId, sortOrder) =>
      prisma.productImage.update({
        where: { id: Number(imageId) },
        data: { sortOrder },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  return NextResponse.json({ ok: true });
}
