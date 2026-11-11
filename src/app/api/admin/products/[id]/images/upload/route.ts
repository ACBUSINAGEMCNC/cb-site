import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/adminAuth";
import { ensureBucket, STORAGE_BUCKET } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function sanitizeFilename(name: string) {
  const baseName = name.replace(/\.[^.]+$/, "");
  const sanitized = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return sanitized || "imagem";
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/pecas", "page");
  revalidatePath("/pecas/[slug]", "page");
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

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file_missing" }, { status: 400 });
  }
  if (!IMAGE_EXTENSIONS[file.type]) {
    return NextResponse.json(
      { ok: false, error: "Formato aceito: PNG, JPEG ou WebP." },
      { status: 415 }
    );
  }
  if (file.size <= 0 || file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "A imagem deve ter até 8 MB." },
      { status: 413 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ ok: false, error: "Peça não encontrada." }, { status: 404 });
  }

  let storagePath: string | undefined;
  try {
    const supabase = await ensureBucket();
    const extension = IMAGE_EXTENSIONS[file.type];
    const filename = `${Date.now()}-${sanitizeFilename(file.name)}.${extension}`;
    storagePath = `products/${productId}/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: `Falha ao enviar imagem: ${uploadError.message}` },
        { status: 502 }
      );
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    const lastImage = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { sortOrder: true },
    });
    const isPrimary = !lastImage;
    const created = await prisma.productImage.create({
      data: {
        productId,
        url: data.publicUrl,
        storagePath,
        isPrimary,
        sortOrder: (lastImage?.sortOrder ?? -1) + 1,
      },
    });

    revalidateCatalog();
    return NextResponse.json({ ok: true, image: created });
  } catch (error) {
    if (storagePath) {
      const supabase = await ensureBucket().catch(() => null);
      if (supabase) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => null);
      }
    }
    const message =
      error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
