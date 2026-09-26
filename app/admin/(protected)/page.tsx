import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Clock3, TrendingUp, UsersRound, XCircle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration, RegistrationStatus } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { InstallButton } from "@/components/install-button";
import styles from "./dashboard.module.css";

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
  const stats = [
    { label: "Total de inscrições", value: counts.total, icon: UsersRound, tone: "primary" },
    { label: "Aguardando análise", value: counts.pending, icon: Clock3, tone: "warning" },
    { label: "Atletas aprovados", value: counts.approved, icon: CheckCircle2, tone: "success" },
    { label: "Não aprovados", value: counts.rejected, icon: XCircle, tone: "neutral" },
  ];
  return <>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Painel administrativo</p><h1>Visão geral</h1><p className={styles.subtitle}>Uma visão rápida das inscrições da escola.</p></div>
      <div className={styles.actions}><InstallButton/><Link className="btn btn-primary" href="/admin/inscricoes">Ver inscrições <ArrowRight size={17}/></Link></div>
    </header>
    <section className={styles.stats} aria-label="Resumo das inscrições">
      {stats.map(({ label, value, icon: Icon, tone }) => <article className={`${styles.stat} ${styles[tone]}`} key={label}>
        <div className={styles.statTop}><span className={styles.statIcon}><Icon size={19}/></span><span className={styles.statLabel}>{label}</span></div>
        <div className={styles.statBottom}><strong className={styles.statValue}>{value}</strong>{tone === "primary" && <span className={styles.statLive}><TrendingUp size={13}/> Atualizado agora</span>}</div>
      </article>)}
    </section>
    <section className={styles.recent}>
      <div className={styles.recentHead}><div><p className={styles.sectionKicker}>Últimas atividades</p><h2>Inscrições recentes</h2></div><span className={styles.liveLabel}><i/> Tempo real</span></div>
      {rows.length ? <div className="table-wrap"><table><thead><tr><th>Atleta</th><th>Responsável</th><th>Recebida em</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="athlete-cell"><span className="avatar">{initials(row.athlete_name)}</span>{row.athlete_name}</div></td><td>{row.guardian_name}</td><td>{formatDate(row.created_at)}</td><td><StatusBadge status={row.status}/></td><td><Link className="row-action" href={`/admin/inscricoes/${row.id}`} aria-label={`Abrir ficha de ${row.athlete_name}`}><ArrowRight size={18}/></Link></td></tr>)}</tbody></table></div> : <div className={styles.empty}><div className={styles.emptyIcon}><ClipboardList size={28}/></div><strong>Nenhuma inscrição por aqui ainda</strong><p>Assim que uma nova ficha for enviada, ela aparecerá neste painel.</p><Link className={styles.emptyLink} href="/admin/inscricoes/nova">Cadastrar manualmente <ArrowRight size={15}/></Link></div>}
    </section>
  </>;
}
