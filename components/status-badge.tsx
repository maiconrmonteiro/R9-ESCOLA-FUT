import type { RegistrationStatus } from "@/lib/types";
const labels = { pending: "Pendente", approved: "Aprovada", rejected: "Recusada" };
export function StatusBadge({ status }: { status: RegistrationStatus }) { return <span className={`badge badge-${status}`}>{labels[status]}</span>; }
