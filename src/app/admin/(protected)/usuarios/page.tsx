import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import {
  createUserAction,
  deleteUserAction,
  updatePasswordAction,
} from "@/app/admin/(protected)/usuarios/actions";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = {
  created?: string;
  deleted?: string;
  password?: string;
  error?: string;
};

const fieldClassName =
  "mt-2 min-h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-accent";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  const [users, params] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    searchParams,
  ]);

  return (
    <div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Acesso ao painel
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-fg">
          Usuários
        </h1>
        <p className="mt-2 max-w-2xl border border-line bg-surface-2 p-3 text-sm leading-6 text-muted">
          Crie logins para quem cadastra/edita peças. Todos os usuários têm
          acesso completo ao painel.
        </p>
      </div>

      {params.error ? (
        <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      {params.created === "1" || params.deleted === "1" || params.password === "1" ? (
        <p role="status" className="mt-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          {params.created === "1"
            ? "Usuário criado."
            : params.deleted === "1"
              ? "Usuário excluído."
              : "Senha atualizada."}
        </p>
      ) : null}

      <section className="mt-7 border border-line bg-surface p-5 sm:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Novo usuário
        </p>
        <form action={createUserAction} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-xs text-muted">
            E-mail*
            <input
              name="email"
              type="email"
              required
              autoComplete="off"
              className={fieldClassName}
            />
          </label>
          <label className="text-xs text-muted">
            Senha* (mín. 8 caracteres)
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={fieldClassName}
            />
          </label>
          <label className="text-xs text-muted">
            Confirmar senha*
            <input
              name="passwordConfirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={fieldClassName}
            />
          </label>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="min-h-10 bg-accent px-4 text-sm font-bold text-accent-fg hover:bg-accent/90"
            >
              Criar usuário
            </button>
          </div>
        </form>
      </section>

      <section className="mt-7 border border-line bg-surface" aria-label="Usuários cadastrados">
        <header className="border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold uppercase text-fg">
            Usuários cadastrados
          </h2>
        </header>
        <ul className="divide-y divide-line">
          {users.map((user) => (
            <li key={user.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_auto] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-fg">
                  {user.email}
                  {user.id === admin.id ? (
                    <span className="ml-2 border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                      você
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  Criado em {dateFormatter.format(user.createdAt)}
                </p>
              </div>

              <form
                action={updatePasswordAction.bind(null, user.id)}
                className="flex flex-wrap items-end gap-2"
              >
                <label className="text-xs text-muted">
                  Nova senha
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`${fieldClassName} w-40`}
                  />
                </label>
                <label className="text-xs text-muted">
                  Confirmar
                  <input
                    name="passwordConfirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`${fieldClassName} w-40`}
                  />
                </label>
                <button
                  type="submit"
                  className="min-h-10 border border-line px-3 text-xs text-fg hover:border-accent/50 hover:text-accent"
                >
                  Trocar senha
                </button>
              </form>

              <div className="lg:justify-self-end">
                {user.id === admin.id ? (
                  <span className="text-xs text-muted">
                    Não é possível excluir o próprio usuário.
                  </span>
                ) : (
                  <form action={deleteUserAction.bind(null, user.id)}>
                    <ConfirmDeleteButton
                      confirmation={`Excluir o usuário ${user.email}?`}
                      className="min-h-10 border border-red-400/30 px-3 text-xs text-red-200 hover:bg-red-400/10"
                    >
                      Excluir
                    </ConfirmDeleteButton>
                  </form>
                )}
              </div>
            </li>
          ))}
          {users.length === 0 ? (
            <li className="px-5 py-6 text-sm text-muted">
              Nenhum usuário cadastrado.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
