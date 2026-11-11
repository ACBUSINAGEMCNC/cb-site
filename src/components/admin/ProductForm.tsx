type CategoryOption = {
  id: number;
  name: string;
};

export type ProductFormValues = {
  internalCode: string | null;
  name: string;
  categoryId: number;
  application: string | null;
  description: string | null;
  material: string | null;
  treatment: string | null;
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
};

type ProductFormProps = {
  categories: CategoryOption[];
  action: (formData: FormData) => void | Promise<void>;
  values?: ProductFormValues;
  submitLabel: string;
  error?: string;
  notice?: string;
};

const inputClassName =
  "mt-2 min-h-11 w-full border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";

export default function ProductForm({
  categories,
  action,
  values,
  submitLabel,
  error,
  notice,
}: ProductFormProps) {
  return (
    <form action={action} className="border border-line bg-surface p-5 sm:p-7">
      {notice ? (
        <p role="status" className="mb-5 border border-green/40 bg-green/10 p-3 text-sm text-fg">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-steel">
          Código <span className="text-accent">*</span>
          <input
            name="internalCode"
            defaultValue={values?.internalCode ?? ""}
            autoCapitalize="characters"
            autoComplete="off"
            required
            style={{ textTransform: "uppercase" }}
            className={inputClassName}
          />
          <span className="mt-1 block text-[11px] text-muted">
            O endereço da peça é gerado automaticamente pelo código.
          </span>
        </label>
        <label className="text-xs font-medium text-steel">
          Nome <span className="text-accent">*</span>
          <input
            name="name"
            defaultValue={values?.name ?? ""}
            required
            className={inputClassName}
          />
        </label>

        <label className="text-xs font-medium text-steel sm:col-span-2">
          Máquina / categoria <span className="text-accent">*</span>
          <select
            name="categoryId"
            defaultValue={values ? String(values.categoryId) : ""}
            required
            className={inputClassName}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <span className="mt-1 block text-[11px] text-muted">
              Cadastre uma categoria antes de criar peças.
            </span>
          ) : null}
        </label>

        <label className="text-xs font-medium text-steel sm:col-span-2">
          Modelos compatíveis
          <textarea
            name="application"
            defaultValue={values?.application ?? ""}
            rows={2}
            className={`${inputClassName} min-h-20 resize-y`}
          />
          <span className="mt-1 block text-[11px] text-muted">
            Separe os modelos por / ou vírgula.
          </span>
        </label>

        <label className="text-xs font-medium text-steel sm:col-span-2">
          Descrição
          <textarea
            name="description"
            defaultValue={values?.description ?? ""}
            rows={3}
            className={`${inputClassName} min-h-24 resize-y`}
          />
        </label>
        <label className="text-xs font-medium text-steel">
          Material
          <input
            name="material"
            defaultValue={values?.material ?? ""}
            className={inputClassName}
          />
        </label>
        <label className="text-xs font-medium text-steel">
          Tratamento
          <input
            name="treatment"
            defaultValue={values?.treatment ?? ""}
            className={inputClassName}
          />
        </label>
        <label className="text-xs font-medium text-steel">
          Ordem
          <input
            name="sortOrder"
            type="number"
            defaultValue={values?.sortOrder ?? 0}
            className={inputClassName}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 border-t border-line pt-5">
        <label className="inline-flex items-center gap-2 text-sm text-steel">
          <input
            name="isHighlighted"
            type="checkbox"
            defaultChecked={values?.isHighlighted ?? false}
            className="h-4 w-4 accent-accent"
          />
          Destaque na Home
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-steel">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={values?.isActive ?? true}
            className="h-4 w-4 accent-accent"
          />
          Ativo no catálogo
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-xs text-muted">Campos marcados com * são obrigatórios.</p>
        <button
          type="submit"
          disabled={categories.length === 0}
          className="min-h-11 bg-accent px-5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
