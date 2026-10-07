import Link from "next/link";
import { AlertTriangle, CalendarCheck, CheckCircle2, ClipboardCheck, UserX } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { reviewAttendanceLink } from "./actions";
import styles from "./presencas.module.css";

type AttendanceRecord = {
  id: string; status: "C" | "F" | "FJ"; raw_athlete_name: string;
  needs_review: boolean; match_confidence: number | null;
  registrations: { id: string; athlete_name: string } | null;
};
type Session = {
  id: string; session_date: string; source_file: string | null;
  classes: { name: string; shift: string } | null;
  attendance_records: AttendanceRecord[];
};
type AthleteOption = { id: string; athlete_name: string; class_name: string | null };

function dateBr(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)); }

export default async function AttendanceReport({ searchParams }: { searchParams: Promise<{ turma?: string; status?: string; erro?: string; sucesso?: string }> }) {
  const params = await searchParams;
  let sessions: Session[] = [];
  let athleteOptions: AthleteOption[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("attendance_sessions").select("id,session_date,source_file,classes(name,shift),attendance_records(id,status,raw_athlete_name,needs_review,match_confidence,registrations(id,athlete_name))").order("session_date", { ascending: false });
    sessions = (data ?? []) as unknown as Session[];
    const { data: athleteData } = await supabase.from("registrations").select("id,athlete_name,class_name").eq("status", "approved").order("athlete_name");
    athleteOptions = (athleteData ?? []) as AthleteOption[];
  }
  const classOptions = [...new Set(sessions.map(item => item.classes ? `${item.classes.name} — ${item.classes.shift}` : ""))].filter(Boolean);
  const filtered = sessions.filter(item => !params.turma || `${item.classes?.name} — ${item.classes?.shift}` === params.turma);
  const records = filtered.flatMap(item => item.attendance_records).filter(item => !params.status || item.status === params.status);
  const presents = records.filter(item => item.status === "C").length;
  const absences = records.filter(item => item.status === "F").length;
  const justified = records.filter(item => item.status === "FJ").length;
  const review = records.filter(item => item.needs_review).length;

  return <>
    <header className="page-head"><div><p className="eyebrow">Relatórios</p><h1>Presenças</h1><p>Acompanhe frequência, faltas e registros importados das listas.</p></div></header>
    {params.erro && <div className={styles.errorMessage} role="alert">Não foi possível salvar a revisão. Tente novamente.</div>}
    {params.sucesso && <div className={styles.successMessage} role="status">Vínculo revisado com sucesso.</div>}
    <section className={styles.kpis}>
      <div><span><CalendarCheck size={20}/></span><strong>{filtered.length}</strong><small>aulas registradas</small></div>
      <div className={styles.positive}><span><CheckCircle2 size={20}/></span><strong>{presents}</strong><small>presenças</small></div>
      <div className={styles.negative}><span><UserX size={20}/></span><strong>{absences}</strong><small>faltas</small></div>
      <div className={styles.warning}><span><ClipboardCheck size={20}/></span><strong>{justified}</strong><small>justificadas</small></div>
      <div className={review ? styles.review : ""}><span><AlertTriangle size={20}/></span><strong>{review}</strong><small>vínculos para revisar</small></div>
    </section>
    <section className="card section-card">
      <div className="section-head">
        <form className="toolbar">
          <select className="search-input" name="turma" defaultValue={params.turma ?? ""}><option value="">Todas as turmas</option>{classOptions.map(item => <option key={item}>{item}</option>)}</select>
          <select className="search-input" name="status" defaultValue={params.status ?? ""}><option value="">Todos os registros</option><option value="C">Presenças</option><option value="F">Faltas</option><option value="FJ">Faltas justificadas</option></select>
          <button className="btn btn-secondary">Filtrar</button>
        </form>
        <span className={styles.total}>{records.length} lançamento(s)</span>
      </div>
      <div className="table-wrap"><table><thead><tr><th>Data</th><th>Turma</th><th>Atleta</th><th>Status</th><th>Vínculo</th></tr></thead><tbody>
        {filtered.flatMap(session => session.attendance_records.filter(record => !params.status || record.status === params.status).map(record => <tr key={record.id}>
          <td>{dateBr(session.session_date)}</td><td>{session.classes?.name} — {session.classes?.shift}</td>
          <td>{record.registrations ? <Link className={styles.athleteLink} href={`/admin/inscricoes/${record.registrations.id}`}>{record.registrations.athlete_name}</Link> : record.raw_athlete_name}</td>
          <td><span className={`${styles.status} ${styles[`status${record.status}`]}`}>{record.status === "C" ? "Presença" : record.status === "F" ? "Falta" : "Justificada"}</span></td>
          <td>{record.needs_review ? <details className={styles.reviewControl}><summary className={styles.reviewTag}><AlertTriangle size={13}/> Revisar vínculo</summary><form action={reviewAttendanceLink}><input type="hidden" name="recordId" value={record.id}/><label><span>Cadastro correto</span><select name="registrationId" required defaultValue={record.registrations?.id ?? ""}><option value="" disabled>Selecione o atleta</option>{athleteOptions.map(athlete => <option key={athlete.id} value={athlete.id}>{athlete.athlete_name}{athlete.class_name ? ` — ${athlete.class_name}` : ""}</option>)}<option value="__none__">Sem cadastro correspondente</option></select></label><button className="btn btn-primary">Confirmar vínculo</button></form></details> : <span className={styles.matched}>Confirmado</span>}</td>
        </tr>))}
      </tbody></table></div>
      {!records.length && <div className="empty"><strong>Nenhuma presença encontrada</strong><p>Aplique as migrações de presença ou ajuste os filtros.</p></div>}
    </section>
  </>;
}
