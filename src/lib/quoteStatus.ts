export const QUOTE_STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "respondido", label: "Respondido" },
  { value: "concluido", label: "Concluído" },
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]["value"];

export function quoteStatusLabel(status: string) {
  return (
    QUOTE_STATUSES.find((option) => option.value === status)?.label ?? status
  );
}

export function quoteStatusClass(status: string) {
  switch (status) {
    case "novo":
      return "border-accent/40 bg-accent/10 text-accent";
    case "em_andamento":
      return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    case "respondido":
      return "border-green/40 bg-green/10 text-green";
    case "concluido":
      return "border-line bg-surface-2 text-muted";
    default:
      return "border-line text-muted";
  }
}
