import type { RegistrationStatus } from "@/lib/types";
type DisplayStatus = RegistrationStatus | "archived";
const labels: Record<DisplayStatus, string> = { pending: "Pendente", approved: "Aprovada", rejected: "Recusada", archived: "Arquivada" };
export function StatusBadge({ status }: { status: DisplayStatus }) { return <span className={`badge badge-${status}`}>{labels[status]}</span>; }
