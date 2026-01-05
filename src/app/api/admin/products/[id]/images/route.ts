import { NextResponse } from "next/server";
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
    orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
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
  const isPrimary = Boolean(body?.isPrimary);

  if (!url) return NextResponse.json({ ok: false }, { status: 400 });

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  const created = await prisma.productImage.create({
    data: { productId, url, isPrimary },
  });

  return NextResponse.json({ ok: true, image: created });
}
