import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPecasPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Peças</h1>
            <p className="mt-1 text-sm text-white/70">
              Catálogo (Artcompany / ACB Usinagem CNC).
            </p>
          </div>

          <Link
            href="/admin/pecas/nova"
            className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Nova peça
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-2 bg-white/5 px-4 py-3 text-xs font-semibold text-white/70">
            <div className="col-span-5">Peça</div>
            <div className="col-span-4">Categoria</div>
            <div className="col-span-3">Ações</div>
          </div>

          <div className="divide-y divide-white/10">
            {products.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3">
                <div className="col-span-5">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-white/60">{p.internalCode ?? ""}</div>
                </div>
                <div className="col-span-4 text-sm text-white/80">{p.category.name}</div>
                <div className="col-span-3">
                  <Link
                    className="text-sm text-yellow-300 hover:text-yellow-200"
                    href={`/admin/pecas/${p.id}/editar`}
                  >
                    Editar
                  </Link>
                  <span className="mx-2 text-white/30">|</span>
                  <Link
                    className="text-sm text-green-300 hover:text-green-200"
                    href={`/admin/pecas/${p.id}/imagens`}
                  >
                    Imagens
                  </Link>
                </div>
              </div>
            ))}

            {products.length === 0 ? (
              <div className="px-4 py-8 text-sm text-white/70">
                Nenhuma peça cadastrada ainda.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
