import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export default async function AdminImagensPecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] } },
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <div className="text-sm text-white/70">Peça não encontrada.</div>
        </div>
      </div>
    );
  }

  async function addUrl(formData: FormData) {
    "use server";

    const url = String(formData.get("url") ?? "").trim();
    const isPrimary = formData.get("isPrimary") === "on";

    if (!url) return;

    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    await prisma.productImage.create({
      data: { productId, url, isPrimary },
    });
  }

  async function setPrimary(imageId: number) {
    "use server";

    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  async function removeImage(imageId: number) {
    "use server";

    const img = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!img) return;

    await prisma.productImage.delete({ where: { id: imageId } });

    if (img.url.startsWith(`/product-images/${productId}/`)) {
      const rel = img.url.replace(/^\//, "");
      const fileOnDisk = path.join(process.cwd(), "public", rel);
      await fs.unlink(fileOnDisk).catch(() => null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Imagens da peça</h1>
            <div className="mt-1 text-sm text-white/70">
              {product.internalCode ?? ""} {product.name}
            </div>
          </div>
          <Link
            href="/admin/pecas"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Adicionar por URL</div>
            <form action={addUrl} className="mt-4 space-y-3">
              <input
                name="url"
                placeholder="https://... ou /product-images/..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-yellow-400"
              />
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  name="isPrimary"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                Definir como principal
              </label>
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-yellow-400 text-sm font-semibold text-black hover:bg-yellow-300"
              >
                Salvar URL
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Upload local (dev)</div>
            <form
              action={`/api/admin/products/${productId}/images/upload`}
              method="post"
              encType="multipart/form-data"
              className="mt-4 space-y-3"
            >
              <input
                name="file"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
              />
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  name="isPrimary"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                Definir como principal
              </label>
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-500"
              >
                Enviar imagem
              </button>
            </form>
            <div className="mt-3 text-xs text-white/60">
              Em produção (Vercel), o ideal é usar Supabase Storage.
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="text-sm font-semibold">Imagens cadastradas</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.images.map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-[16/10] bg-black/30">
                  <Image
                    src={img.url}
                    alt={product.internalCode ?? product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {img.isPrimary ? (
                    <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-semibold text-black">
                      Principal
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3 p-4">
                  <div className="break-all text-xs text-white/60">{img.url}</div>
                  <div className="flex items-center justify-between">
                    <form action={async () => setPrimary(img.id)}>
                      <button
                        type="submit"
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                      >
                        Definir principal
                      </button>
                    </form>
                    <form action={async () => removeImage(img.id)}>
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15"
                      >
                        Remover
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}

            {product.images.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                Nenhuma imagem cadastrada ainda.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
