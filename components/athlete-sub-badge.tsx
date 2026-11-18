import { athleteSub } from "@/lib/utils";

export function AthleteSubBadge({ birthDate }: { birthDate?: string | null }) {
  const sub = athleteSub(birthDate);
  const birthYear = birthDate?.slice(0, 4);
  return sub && birthYear ? <span className="athlete-sub-badge" title="Categoria calculada pelo ano de nascimento" aria-label={`${sub}, nascido em ${birthYear}`}>{sub} · {birthYear}</span> : null;
}
