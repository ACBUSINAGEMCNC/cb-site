import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";

export default async function PecasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string | string[]; q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const categoria = Array.isArray(sp.categoria) ? sp.categoria[0] : sp.categoria;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  const products = await prisma.product.findMany({
    include: { category: true, images: true },
    where: {
      ...(categoria ? { category: { slug: categoria } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { internalCode: { contains: q } },
              { application: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ isHighlighted: "desc" }, { updatedAt: "desc" }],
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Catálogo de peças</h1>
            <p className="mt-2 text-sm text-white/70">
              Peças agrícolas paralelas de alta performance.
            </p>
          </div>

          <form className="flex gap-2" action="/pecas">
            {categoria ? <input type="hidden" name="categoria" value={categoria} /> : null}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nome, código ou aplicação"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-yellow-400 md:w-[360px]"
            />
            <button
              className="h-11 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black hover:bg-yellow-300"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/pecas"
            className={`rounded-full border px-3 py-1 text-xs ${
              !categoria
                ? "border-yellow-400 bg-yellow-400 text-black"
                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/pecas?categoria=${c.slug}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                categoria === c.slug
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/pecas/${p.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {(() => {
                  const primary = p.images.find((img) => img.isPrimary) ?? p.images[0];
                  if (!primary) return null;
                  return (
                    <Image
                      src={primary.url}
                      alt={p.internalCode ?? p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  );
                })()}

                {p.images.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      Sem imagem
                    </div>
                  </div>
                ) : null}

                {p.isHighlighted ? (
                  <div className="absolute right-3 top-3 rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-semibold text-black">
                    Destaque
                  </div>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-semibold leading-tight">
                  {p.internalCode ?? p.name}
                </div>
              </div>
              <div className="mt-2 text-sm text-white/80">{p.name}</div>
              <div className="mt-3 text-sm text-white/80">{p.category.name}</div>
              {p.application ? (
                <div className="mt-2 text-sm text-white/70 line-clamp-2">
                  {p.application}
                </div>
              ) : null}
            </Link>
          ))}

          {products.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Nenhuma peça encontrada.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
