import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarRange, CheckCircle2, ClipboardCheck, Clock3, TrendingUp, UserRoundX, UsersRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import styles from "./dashboard.module.css";

type ClassRow = { id: string; name: string; shift: string };
type Athlete = { id: string; athlete_name: string; class_id: string | null; class_name: string | null };
type Attendance = { status: "C" | "F" | "FJ"; registration_id: string | null; needs_review: boolean };
type Session = { id: string; session_date: string; class_id: string; classes: { name: string; shift: string } | null; attendance_records: Attendance[] };

function percent(value: number, total: number) { return total ? Math.round((value / total) * 100) : 0; }
function shortDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)); }

export default async function DashboardPage() {
  let recent: Registration[] = [];
  let athletes: Athlete[] = [];
  let classes: ClassRow[] = [];
  let sessions: Session[] = [];
  let pendingRegistrations = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [recentResult, athletesResult, classesResult, sessionsResult, pendingResult] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("registrations").select("id,athlete_name,class_id,class_name").eq("status", "approved").order("athlete_name"),
      supabase.from("classes").select("id,name,shift").order("name"),
      supabase.from("attendance_sessions").select("id,session_date,class_id,classes(name,shift),attendance_records(status,registration_id,needs_review)").order("session_date", { ascending: false }),
      supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    recent = (recentResult.data ?? []) as Registration[];
    athletes = (athletesResult.data ?? []) as Athlete[];
    classes = (classesResult.data ?? []) as ClassRow[];
    sessions = (sessionsResult.data ?? []) as unknown as Session[];
    pendingRegistrations = pendingResult.count ?? 0;
  }

  const allAttendance = sessions.flatMap(session => session.attendance_records);
  const present = allAttendance.filter(record => record.status === "C").length;
  const attendanceRate = percent(present, allAttendance.length);
  const unlinked = athletes.filter(athlete => !athlete.class_id).length;
  const reviews = allAttendance.filter(record => record.needs_review).length;

  const trendMap = new Map<string, { present: number; absent: number }>();
  for (const session of [...sessions].reverse()) {
    const current = trendMap.get(session.session_date) ?? { present: 0, absent: 0 };
    current.present += session.attendance_records.filter(record => record.status === "C").length;
    current.absent += session.attendance_records.filter(record => record.status !== "C").length;
    trendMap.set(session.session_date, current);
  }
  const trend = [...trendMap.entries()].slice(-8);
  const trendMax = Math.max(1, ...trend.map(([, value]) => value.present + value.absent));

  const classPerformance = classes.map(item => {
    const classSessions = sessions.filter(session => session.class_id === item.id);
    const records = classSessions.flatMap(session => session.attendance_records);
    const enrolled = athletes.filter(athlete => athlete.class_id === item.id).length;
    const classPresent = records.filter(record => record.status === "C").length;
    return { ...item, enrolled, sessions: classSessions.length, rate: percent(classPresent, records.length), absences: records.filter(record => record.status === "F").length };
  }).sort((a, b) => a.rate - b.rate);

  const athleteAttendance = new Map<string, { present: number; total: number }>();
  for (const record of allAttendance) if (record.registration_id) {
    const current = athleteAttendance.get(record.registration_id) ?? { present: 0, total: 0 };
    current.total++; if (record.status === "C") current.present++;
    athleteAttendance.set(record.registration_id, current);
  }
  const lowAttendance = athletes.map(athlete => ({ athlete, data: athleteAttendance.get(athlete.id) }))
    .filter(item => item.data && item.data.total >= 2 && percent(item.data.present, item.data.total) < 75)
    .sort((a, b) => percent(a.data!.present, a.data!.total) - percent(b.data!.present, b.data!.total)).slice(0, 5);

  const stats = [
    { label: "Atletas ativos", value: athletes.length, suffix: "", icon: UsersRound, href: "/admin/inscricoes?status=approved", tone: "primary" },
    { label: "Turmas cadastradas", value: classes.length, suffix: "", icon: CalendarRange, href: "/admin/turmas", tone: "neutral" },
    { label: "Atletas sem turma", value: unlinked, suffix: "", icon: UserRoundX, href: "/admin/turmas", tone: unlinked ? "warning" : "success" },
    { label: "Frequência geral", value: attendanceRate, suffix: "%", icon: TrendingUp, href: "/admin/relatorios/presencas", tone: attendanceRate < 75 ? "warning" : "success" },
    { label: "Vínculos para revisar", value: reviews, suffix: "", icon: ClipboardCheck, href: "/admin/relatorios/presencas", tone: reviews ? "warning" : "success" },
  ];

  return <>
    <header className={styles.header}><div><p className={styles.eyebrow}>Painel operacional</p><h1>Visão geral</h1><p className={styles.subtitle}>Atletas, turmas e frequência em um só lugar.</p></div><div className={styles.headerActions}><div className={styles.updated}><i/> Dados atualizados</div><Link href="/admin/chamadas" className="btn btn-primary"><CalendarRange size={17}/> Fazer chamada</Link></div></header>
    <section className={styles.stats} aria-label="Indicadores principais">{stats.map(({ label, value, suffix, icon: Icon, href, tone }) => <Link href={href} className={`${styles.stat} ${styles[tone]}`} key={label}><div className={styles.statTop}><span className={styles.statIcon}><Icon size={19}/></span><span className={styles.statLabel}>{label}</span></div><div className={styles.statBottom}><strong className={styles.statValue}>{value}{suffix}</strong><ArrowRight size={17}/></div></Link>)}</section>

    <section className={styles.mainGrid}>
      <article className={styles.panel}>
        <div className={styles.panelHead}><div><p className={styles.sectionKicker}>Últimas aulas</p><h2>Evolução da frequência</h2></div><Link href="/admin/relatorios/presencas">Ver relatório <ArrowRight size={14}/></Link></div>
        {trend.length ? <div className={styles.chart}>{trend.map(([date, value]) => <div className={styles.chartColumn} key={date}><div className={styles.bars} title={`${value.present} presenças e ${value.absent} ausências`}><i className={styles.presentBar} style={{ height: `${Math.max(4, value.present / trendMax * 100)}%` }}/><i className={styles.absentBar} style={{ height: `${Math.max(4, value.absent / trendMax * 100)}%` }}/></div><span>{shortDate(date)}</span></div>)}</div> : <div className={styles.compactEmpty}>Ainda não há aulas registradas.</div>}
        <div className={styles.legend}><span><i className={styles.presentDot}/>Presenças</span><span><i className={styles.absentDot}/>Faltas e justificadas</span></div>
      </article>

      <article className={styles.panel}>
        <div className={styles.panelHead}><div><p className={styles.sectionKicker}>Ações necessárias</p><h2>Alertas</h2></div></div>
        <div className={styles.alertList}>
          <Link href="/admin/turmas"><span className={unlinked ? styles.alertIcon : styles.okIcon}><UserRoundX size={18}/></span><div><strong>{unlinked} atleta(s) sem turma</strong><small>Organize os atletas aprovados</small></div><ArrowRight size={16}/></Link>
          <Link href="/admin/relatorios/presencas"><span className={reviews ? styles.alertIcon : styles.okIcon}><AlertTriangle size={18}/></span><div><strong>{reviews} vínculo(s) para revisar</strong><small>Confirme os nomes importados</small></div><ArrowRight size={16}/></Link>
          <Link href="/admin/inscricoes?status=pending"><span className={pendingRegistrations ? styles.alertIcon : styles.okIcon}><Clock3 size={18}/></span><div><strong>{pendingRegistrations} inscrição(ões) pendente(s)</strong><small>Analise os novos cadastros</small></div><ArrowRight size={16}/></Link>
        </div>
      </article>
    </section>

    <section className={styles.secondaryGrid}>
      <article className={styles.panel}><div className={styles.panelHead}><div><p className={styles.sectionKicker}>Comparativo</p><h2>Desempenho por turma</h2></div><Link href="/admin/turmas">Ver turmas <ArrowRight size={14}/></Link></div><div className={styles.classList}>{classPerformance.map(item => <div key={item.id}><div className={styles.classTitle}><strong>{item.name} — {item.shift}</strong><span>{item.rate}%</span></div><div className={styles.progress}><i style={{ width: `${item.rate}%` }}/></div><small>{item.enrolled} atletas · {item.sessions} aulas · {item.absences} faltas</small></div>)}{!classPerformance.length && <div className={styles.compactEmpty}>Nenhuma turma cadastrada.</div>}</div></article>
      <article className={styles.panel}><div className={styles.panelHead}><div><p className={styles.sectionKicker}>Acompanhamento</p><h2>Baixa frequência</h2></div></div><div className={styles.lowList}>{lowAttendance.map(({ athlete, data }) => <Link href={`/admin/inscricoes/${athlete.id}`} key={athlete.id}><span className="avatar">{initials(athlete.athlete_name)}</span><div><strong>{athlete.athlete_name}</strong><small>{athlete.class_name ?? "Sem turma"}</small></div><b>{percent(data!.present, data!.total)}%</b></Link>)}{!lowAttendance.length && <div className={styles.goodEmpty}><CheckCircle2 size={22}/>Nenhum atleta com frequência abaixo de 75%.</div>}</div></article>
    </section>

    <section className={styles.recent}><div className={styles.recentHead}><div><p className={styles.sectionKicker}>Cadastros</p><h2>Inscrições recentes</h2></div><Link href="/admin/inscricoes">Ver todas <ArrowRight size={14}/></Link></div>{recent.length ? <div className={`table-wrap ${styles.recentTable}`}><table><thead><tr><th>Atleta</th><th>Responsável</th><th>Recebida em</th><th>Status</th><th></th></tr></thead><tbody>{recent.map(row => <tr key={row.id}><td data-label="Atleta"><div className="athlete-cell"><span className="avatar">{initials(row.athlete_name)}</span>{row.athlete_name}</div></td><td data-label="Responsável">{row.guardian_name}</td><td data-label="Recebida em">{formatDate(row.created_at)}</td><td data-label="Status"><StatusBadge status={row.status}/></td><td className={styles.rowLink}><Link className="row-action" href={`/admin/inscricoes/${row.id}`}><ArrowRight size={18}/></Link></td></tr>)}</tbody></table></div> : <div className={styles.compactEmpty}>Nenhuma inscrição cadastrada.</div>}</section>
  </>;
}
