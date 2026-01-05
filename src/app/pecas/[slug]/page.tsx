import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";

export default async function PecaDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true },
  });

  if (!product) notFound();

  const messageParts = [
    `Olá, vi a peça ${product.name} no site e gostaria de um orçamento.`,
    product.internalCode ? `Código: ${product.internalCode}` : null,
  ].filter(Boolean);

  const whatsappHref = `https://wa.me/5545999434981?text=${encodeURIComponent(
    messageParts.join(" | ")
  )}`;

  const sortedImages = [...product.images].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return a.id - b.id;
    return a.isPrimary ? -1 : 1;
  });

  const primaryImage = sortedImages[0] ?? null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs text-white/60">Categoria</div>
            <div className="mt-1 text-sm font-semibold text-yellow-300">
              {product.category.name}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {product.internalCode ?? product.name}
            </h1>

            <div className="mt-2 text-sm text-white/80">{product.name}</div>

            {product.application ? (
              <div className="mt-6">
                <div className="text-sm font-semibold">Aplicação</div>
                <div className="mt-2 text-sm text-white/75">{product.application}</div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.material ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Material</div>
                  <div className="mt-1 text-sm text-white">{product.material}</div>
                </div>
              ) : null}
              {product.treatment ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Tratamento</div>
                  <div className="mt-1 text-sm text-white">{product.treatment}</div>
                </div>
              ) : null}
            </div>

            {product.description ? (
              <div className="mt-6">
                <div className="text-sm font-semibold">Descrição</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">
                  {product.description}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-500"
              >
                Consultar no WhatsApp
              </a>
              <a
                href="/pecas"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver outras peças
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Imagens</div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <div className="relative aspect-[16/10]">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={product.internalCode ?? product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      Sem imagem
                    </div>
                  </div>
                )}
              </div>
            </div>

            {sortedImages.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {sortedImages.slice(0, 8).map((img) => (
                  <a
                    key={img.id}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:border-yellow-300"
                    title={img.isPrimary ? "Imagem principal" : "Imagem"}
                  >
                    <Image
                      src={img.url}
                      alt={product.internalCode ?? product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {img.isPrimary ? (
                      <div className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-semibold text-black">
                        Principal
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
              Para adicionar imagens, use o painel Admin: Peças → Imagens.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
