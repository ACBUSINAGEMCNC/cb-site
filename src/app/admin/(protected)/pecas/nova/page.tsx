import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminNovaPecaPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function create(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const internalCode = String(formData.get("internalCode") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const application = String(formData.get("application") ?? "").trim() || null;
    const material = String(formData.get("material") ?? "").trim() || null;
    const treatment = String(formData.get("treatment") ?? "").trim() || null;
    const categoryId = Number(formData.get("categoryId"));
    const isHighlighted = formData.get("isHighlighted") === "on";

    if (!name || !slug || !categoryId) return;

    await prisma.product.create({
      data: {
        name,
        slug,
        internalCode,
        description,
        application,
        material,
        treatment,
        isHighlighted,
        categoryId,
      },
    });

    redirect("/admin/pecas");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Nova peça</h1>

        <form action={create} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Nome</label>
              <input name="name" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Slug (URL)</label>
              <input name="slug" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Código interno</label>
              <input name="internalCode" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Categoria</label>
              <select name="categoryId" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" required>
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Aplicação (máquinas/linhas)</label>
            <input name="application" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Material</label>
              <input name="material" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Tratamento</label>
              <input name="treatment" className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Descrição</label>
            <textarea name="description" className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-yellow-400" />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input name="isHighlighted" type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/40" />
            Destaque na Home
          </label>

          <div className="flex items-center justify-end gap-3">
            <a href="/admin/pecas" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Cancelar
            </a>
            <button type="submit" className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
