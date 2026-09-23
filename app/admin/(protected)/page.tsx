import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration, RegistrationStatus } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export default async function DashboardPage() {
  let rows: Registration[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("registrations").select("*").order("created_at", { ascending: false }).limit(6);
    rows = (data ?? []) as Registration[];
  }
  const counts: Record<RegistrationStatus | "total", number> = { total: 0, pending: 0, approved: 0, rejected: 0 };
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }] = await Promise.all([
      supabase.from("registrations").select("id", { count: "exact", head: true }),
      supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);
    Object.assign(counts, { total: total ?? 0, pending: pending ?? 0, approved: approved ?? 0, rejected: rejected ?? 0 });
  }
  return <><header className="page-head"><div><p className="eyebrow">Central administrativa</p><h1>Visão geral</h1><p>Acompanhe inscrições e decisões da equipe.</p></div><Link className="btn btn-primary" href="/admin/inscricoes">Ver todas <ArrowRight size={17}/></Link></header><section className="stats"><div className="card stat"><div className="stat-label">Total de inscrições</div><div className="stat-value">{counts.total}</div></div><div className="card stat pending"><div className="stat-label">Aguardando análise</div><div className="stat-value">{counts.pending}</div></div><div className="card stat"><div className="stat-label">Atletas aprovados</div><div className="stat-value">{counts.approved}</div></div><div className="card stat"><div className="stat-label">Recusadas</div><div className="stat-value">{counts.rejected}</div></div></section><section className="card section-card"><div className="section-head"><h2>Inscrições recentes</h2><span style={{fontSize:13,color:"var(--muted)"}}>Dados em tempo real</span></div>{rows.length ? <div className="table-wrap"><table><thead><tr><th>Atleta</th><th>Responsável</th><th>Recebida em</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="athlete-cell"><span className="avatar">{initials(row.athlete_name)}</span>{row.athlete_name}</div></td><td>{row.guardian_name}</td><td>{formatDate(row.created_at)}</td><td><StatusBadge status={row.status}/></td><td><Link href={`/admin/inscricoes/${row.id}`} aria-label={`Abrir ficha de ${row.athlete_name}`}><ArrowRight size={18}/></Link></td></tr>)}</tbody></table></div> : <div className="empty"><ClipboardList size={34} style={{margin:"0 auto 12px"}}/><strong>Nenhuma inscrição recebida</strong><p>Os novos cadastros aparecerão aqui assim que forem enviados.</p></div>}</section></>;
}
