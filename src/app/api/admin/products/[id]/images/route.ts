import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ ok: true, images });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

  const body = (await req.json().catch(() => null)) as
    | { url?: string; isPrimary?: boolean }
    | null;

  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ ok: false, error: "URL obrigatória." }, { status: 400 });
  }
  if (!url.startsWith("/catalog/")) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Informe uma URL http(s) válida ou um caminho /catalog/." },
        { status: 400 }
      );
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ ok: false, error: "Peça não encontrada." }, { status: 404 });
  }

  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
    select: { sortOrder: true },
  });
  const isPrimary = Boolean(body?.isPrimary) || !lastImage;
  const created = await prisma.$transaction(async (transaction) => {
    if (isPrimary) {
      await transaction.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    return transaction.productImage.create({
      data: {
        productId,
        url,
        isPrimary,
        sortOrder: (lastImage?.sortOrder ?? -1) + 1,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
  return NextResponse.json({ ok: true, image: created });
}
