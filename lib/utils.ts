export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function titleCase(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}
