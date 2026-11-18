import { athleteSub } from "@/lib/utils";

export function AthleteSubBadge({ birthDate }: { birthDate?: string | null }) {
  const sub = athleteSub(birthDate);
  return sub ? <span className="athlete-sub-badge" title="Categoria calculada pelo ano de nascimento" aria-label={`Categoria real: ${sub}`}>{sub}</span> : null;
}
