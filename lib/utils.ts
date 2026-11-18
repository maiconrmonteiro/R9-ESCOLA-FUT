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

/** Real age category follows the athlete's birth year, independently of training class. */
export function athleteSub(birthDate?: string | null, seasonYear = new Date().getFullYear()) {
  if (!birthDate) return null;
  const birthYear = Number(birthDate.slice(0, 4));
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > seasonYear) return null;
  return `Sub ${seasonYear - birthYear}`;
}
