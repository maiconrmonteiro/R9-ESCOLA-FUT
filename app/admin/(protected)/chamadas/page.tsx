import { CalendarCheck, CheckCircle2, Clock3, Play, UsersRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { startCall } from "./actions";
import styles from "./chamadas.module.css";

type ClassRow = { id: string; name: string; shift: string; training_days: string; start_time: string; end_time: string; athlete_count: number };
type CallRow = { id: string; class_id: string; session_status: string; classes: { name: string; shift: string } | null };
function todayInSaoPaulo() { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
function time(value: string) { return value.slice(0, 5); }

export default async function CallsPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const params = await searchParams; const today = todayInSaoPaulo();
  let classes: ClassRow[] = []; let calls: CallRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [classResult, callResult, athleteResult] = await Promise.all([
      supabase.from("classes").select("id,name,shift,training_days,start_time,end_time").order("start_time"),
      supabase.from("attendance_sessions").select("id,class_id,session_status,classes(name,shift)").eq("session_date", today),
      supabase.from("registrations").select("class_id").eq("status", "approved").is("archived_at", null).not("class_id", "is", null),
    ]);
    const counts = new Map<string, number>();
    for (const athlete of athleteResult.data ?? []) if (athlete.class_id) counts.set(athlete.class_id, (counts.get(athlete.class_id) ?? 0) + 1);
    classes = (classResult.data ?? []).map(item => ({ ...item, athlete_count: counts.get(item.id) ?? 0 })) as ClassRow[];
    calls = (callResult.data ?? []) as unknown as CallRow[];
  }
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" }).format(new Date());
  const likely = classes.filter(item => item.training_days.toLocaleLowerCase("pt-BR").includes(weekday.split("-")[0]));
  const ordered = [...likely, ...classes.filter(item => !likely.some(match => match.id === item.id))];
  return <>
    <header className="page-head"><div><p className="eyebrow">Equipe</p><h1>Chamadas</h1><p>Faça a chamada de forma rápida, direto pelo celular.</p></div></header>
    {params.erro && <div className={styles.error}>Não foi possível iniciar a chamada.</div>}
    <section className={styles.today}><div><span><CalendarCheck size={22}/></span><div><small>Hoje</small><strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "America/Sao_Paulo" }).format(new Date())}</strong></div></div><p>{calls.filter(item => item.session_status === "finalized").length} chamada(s) concluída(s)</p></section>
    <div className={styles.sectionTitle}><div><p className="section-kicker">Agenda do dia</p><h2>Escolha uma turma</h2></div>{likely.length > 0 && <span>Sugestões primeiro</span>}</div>
    <section className={styles.classGrid}>{ordered.map(item => {
      const call = calls.find(current => current.class_id === item.id); const suggested = likely.some(match => match.id === item.id);
      return <article className={`${styles.classCard} ${suggested ? styles.suggested : ""}`} key={item.id}>{suggested && <span className={styles.suggestion}>Turma de hoje</span>}<div className={styles.classTop}><span className={styles.classIcon}><UsersRound size={21}/></span><div><small>{item.shift}</small><h3>{item.name}</h3></div></div><div className={styles.classMeta}><span><Clock3 size={15}/>{time(item.start_time)} às {time(item.end_time)}</span><span><UsersRound size={15}/>{item.athlete_count} atletas</span></div>{call ? <a className={`btn ${call.session_status === "finalized" ? "btn-secondary" : "btn-primary"}`} href={`/admin/chamadas/${call.id}`}>{call.session_status === "finalized" ? <><CheckCircle2 size={17}/> Ver chamada concluída</> : <><Play size={17}/> Continuar chamada</>}</a> : <form action={startCall}><input type="hidden" name="classId" value={item.id}/><input type="hidden" name="sessionDate" value={today}/><button className="btn btn-primary"><Play size={17}/> Iniciar chamada</button></form>}</article>;
    })}</section>
  </>;
}
