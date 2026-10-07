"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, CheckCheck, Loader2, Search, ShieldCheck } from "lucide-react";
import { finalizeCall, markAllPresent, markAttendance } from "@/app/admin/(protected)/chamadas/actions";

type Athlete = { id: string; athlete_name: string; athlete_nickname: string | null };
type Status = "C" | "F" | "FJ";

export function AttendanceCall({ sessionId, sessionDate, athletes, initial, finalized, initialNotes }: { sessionId: string; sessionDate: string; athletes: Athlete[]; initial: Record<string, Status>; finalized: boolean; initialNotes: string }) {
  const [marks, setMarks] = useState(initial); const [filter, setFilter] = useState<"all" | "pending" | "absence">("all"); const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition(); const [message, setMessage] = useState(""); const [notes, setNotes] = useState(initialNotes); const [done, setDone] = useState(finalized);
  const counts = { C: Object.values(marks).filter(value => value === "C").length, F: Object.values(marks).filter(value => value === "F").length, FJ: Object.values(marks).filter(value => value === "FJ").length };
  const pending = athletes.length - Object.keys(marks).length;
  const visible = useMemo(() => athletes.filter(athlete => athlete.athlete_name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || filter === "pending" && !marks[athlete.id] || filter === "absence" && ["F", "FJ"].includes(marks[athlete.id]))), [athletes, filter, marks, query]);

  function mark(athlete: Athlete, status: Status) { if (done) return; const previous = marks[athlete.id]; setMarks(current => ({ ...current, [athlete.id]: status })); setMessage(""); startTransition(async () => { const result = await markAttendance(sessionId, athlete.id, athlete.athlete_name, status); if (!result.ok) { setMarks(current => previous ? ({ ...current, [athlete.id]: previous }) : Object.fromEntries(Object.entries(current).filter(([id]) => id !== athlete.id))); setMessage("Não foi possível salvar. Tente novamente."); } }); }
  function allPresent() { if (done) return; const previous = marks; setMarks(Object.fromEntries(athletes.map(athlete => [athlete.id, "C"]))); startTransition(async () => { const result = await markAllPresent(sessionId); if (!result.ok) { setMarks(previous); setMessage("Não foi possível marcar todos."); } }); }
  function finish() { startTransition(async () => { const result = await finalizeCall(sessionId, notes, sessionDate); if (result.ok) { setDone(true); setMessage("Chamada finalizada com sucesso. Data e marcações foram salvas."); } else setMessage(result.error ?? "Não foi possível finalizar."); }); }

  return <div className="call-shell">
    {done && <div className="call-finished"><ShieldCheck size={20}/><div><strong>Chamada finalizada</strong><span>Você ainda pode consultar as marcações abaixo.</span></div></div>}
    <section className="call-progress"><div><span>{Object.keys(marks).length} de {athletes.length} marcados</span><strong>{athletes.length ? Math.round(Object.keys(marks).length / athletes.length * 100) : 100}%</strong></div><i><b style={{ width: `${athletes.length ? Object.keys(marks).length / athletes.length * 100 : 100}%` }}/></i>{!done && <button onClick={allPresent} disabled={isPending}><CheckCheck size={17}/> Marcar todos presentes</button>}</section>
    <section className="call-tools"><div><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar atleta"/></div><nav><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button><button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pendentes {pending}</button><button className={filter === "absence" ? "active" : ""} onClick={() => setFilter("absence")}>Faltas {counts.F + counts.FJ}</button></nav></section>
    {message && <div className={message.includes("sucesso") ? "call-message success" : "call-message"}>{message}</div>}
    <section className="call-list">{visible.map((athlete, index) => <article className={`call-athlete ${marks[athlete.id] ? `marked-${marks[athlete.id]}` : ""}`} key={athlete.id}><span className="call-number">{String(index + 1).padStart(2, "0")}</span><div className="call-name"><strong>{athlete.athlete_name}</strong>{athlete.athlete_nickname && <small>{athlete.athlete_nickname}</small>}</div><div className="call-statuses"><button disabled={done || isPending} className={marks[athlete.id] === "C" ? "selected present" : ""} onClick={() => mark(athlete, "C")}><Check size={16}/><span>Presente</span></button><button disabled={done || isPending} className={marks[athlete.id] === "F" ? "selected absent" : ""} onClick={() => mark(athlete, "F")}><b>F</b><span>Falta</span></button><button disabled={done || isPending} className={marks[athlete.id] === "FJ" ? "selected justified" : ""} onClick={() => mark(athlete, "FJ")}><b>FJ</b><span>Justificada</span></button></div></article>)}{!visible.length && <div className="call-empty">Nenhum atleta neste filtro.</div>}</section>
    <div className="call-spacer"/>
    <footer className="call-footer"><div className="call-totals"><span><b>{counts.C}</b> presentes</span><span><b>{counts.F}</b> faltas</span><span><b>{counts.FJ}</b> justificadas</span></div>{!done && <details><summary>Observação da chamada</summary><textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Opcional"/></details>}<button className="call-finish" disabled={done || isPending || pending > 0} onClick={finish}>{isPending ? <Loader2 className="call-spinner" size={18}/> : <ShieldCheck size={18}/>} {done ? "Chamada finalizada" : pending ? `${pending} pendente(s)` : "Finalizar chamada"}</button></footer>
  </div>;
}
