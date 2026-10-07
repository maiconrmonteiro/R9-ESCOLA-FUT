import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, UserX } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import styles from "./presencas.module.css";

type AttendanceRecord = { status: "C" | "F" | "FJ" };
type Session = {
  id: string;
  session_date: string;
  session_status: "draft" | "finalized";
  classes: { name: string; shift: string } | null;
  attendance_records: AttendanceRecord[];
};

function dateBr(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default async function AttendanceReport({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const params = await searchParams;
  let sessions: Session[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("attendance_sessions")
      .select("id,session_date,session_status,classes(name,shift),attendance_records(status)")
      .order("session_date", { ascending: false });
    sessions = (data ?? []) as unknown as Session[];
  }

  const classOptions = [...new Set(sessions.map(item => item.classes ? `${item.classes.name} — ${item.classes.shift}` : ""))].filter(Boolean);
  const filtered = sessions.filter(item => !params.turma || `${item.classes?.name} — ${item.classes?.shift}` === params.turma);
  const allRecords = filtered.flatMap(item => item.attendance_records);
  const presentTotal = allRecords.filter(item => item.status === "C").length;
  const absenceTotal = allRecords.length - presentTotal;

  return <>
    <header className="page-head"><div><p className="eyebrow">Relatórios</p><h1>Presenças</h1><p>Acompanhe a frequência por chamada e abra uma aula para corrigir as marcações.</p></div></header>
    <section className={styles.kpis}>
      <div className={styles.positive}><span><CheckCircle2 size={21}/></span><strong>{percentage(presentTotal, allRecords.length)}%</strong><small>presença</small></div>
      <div className={styles.negative}><span><UserX size={21}/></span><strong>{percentage(absenceTotal, allRecords.length)}%</strong><small>ausência</small></div>
    </section>
    <section className="card section-card">
      <div className="section-head">
        <form className="toolbar">
          <select className="search-input" name="turma" defaultValue={params.turma ?? ""}><option value="">Todas as turmas</option>{classOptions.map(item => <option key={item}>{item}</option>)}</select>
          <button className="btn btn-secondary">Filtrar</button>
        </form>
        <span className={styles.total}>{filtered.length} chamada(s)</span>
      </div>
      <div className="table-wrap"><table><thead><tr><th>Data</th><th>Turma</th><th>Atletas</th><th>Presença</th><th>Ausência</th><th aria-label="Abrir chamada"/></tr></thead><tbody>
        {filtered.map(session => {
          const total = session.attendance_records.length;
          const presents = session.attendance_records.filter(record => record.status === "C").length;
          const absences = total - presents;
          return <tr key={session.id}>
            <td><Link className={styles.rowLink} href={`/admin/relatorios/presencas/${session.id}`}>{dateBr(session.session_date)}</Link></td>
            <td>{session.classes?.name} — {session.classes?.shift}</td>
            <td>{total}</td>
            <td><span className={`${styles.rate} ${styles.presentRate}`}>{percentage(presents, total)}%</span></td>
            <td><span className={`${styles.rate} ${styles.absenceRate}`}>{percentage(absences, total)}%</span></td>
            <td><Link className={styles.openCall} href={`/admin/relatorios/presencas/${session.id}`}>Detalhar <ArrowRight size={15}/></Link></td>
          </tr>;
        })}
      </tbody></table></div>
      {!filtered.length && <div className="empty"><CalendarCheck className="empty-icon" size={28}/><strong>Nenhuma chamada encontrada</strong><p>Ajuste o filtro ou finalize uma chamada para acompanhar a frequência.</p></div>}
    </section>
  </>;
}
