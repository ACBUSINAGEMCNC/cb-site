import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

function safeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 80);
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

  const form = await req.formData();
  const file = form.get("file");
  const makePrimary = form.get("isPrimary") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file_missing" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(file.name || "") || ".jpg";
  const filename = `${Date.now()}-${safeFilename(file.name || "image")}${ext}`;

  const dirOnDisk = path.join(
    process.cwd(),
    "public",
    "product-images",
    String(productId)
  );
  await fs.mkdir(dirOnDisk, { recursive: true });

  const fileOnDisk = path.join(dirOnDisk, filename);
  await fs.writeFile(fileOnDisk, buffer);

  const url = `/product-images/${productId}/${filename}`;

  if (makePrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  const created = await prisma.productImage.create({
    data: { productId, url, isPrimary: makePrimary },
  });

  return NextResponse.json({ ok: true, image: created });
}
