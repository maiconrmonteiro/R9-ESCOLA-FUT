import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportAttendanceEditor } from "@/components/report-attendance-editor";
import "../../../chamadas/call.css";

type Status = "C" | "F" | "FJ";
type AttendanceRecord = { id: string; raw_athlete_name: string; status: Status; registrations: { athlete_name: string } | null };

function dateBr(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

export default async function AttendanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase.from("attendance_sessions")
    .select("id,session_date,classes(name,shift,start_time,end_time),attendance_records(id,raw_athlete_name,status,registrations(athlete_name))")
    .eq("id", id).single();
  if (!session) notFound();
  const classData = session.classes as unknown as { name: string; shift: string; start_time: string | null; end_time: string | null };
  const records = (session.attendance_records ?? []) as unknown as AttendanceRecord[];
  const editorRecords = records.map(record => ({ id: record.id, name: record.registrations?.athlete_name || record.raw_athlete_name, status: record.status })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const presents = records.filter(record => record.status === "C").length;
  const absences = records.length - presents;
  const percent = (value: number) => records.length ? Math.round(value / records.length * 100) : 0;

  return <>
    <header className="call-head"><Link href="/admin/relatorios/presencas"><ArrowLeft size={16}/> Voltar ao relatório</Link><p>Detalhamento da chamada</p><h1>{classData.name}</h1><div><span>{classData.shift}</span><span><CalendarDays size={15}/>{dateBr(session.session_date)}</span>{classData.start_time && classData.end_time && <span><Clock3 size={15}/>{classData.start_time.slice(0,5)} às {classData.end_time.slice(0,5)}</span>}</div></header>
    <div className="call-shell">
      <section className="call-progress"><div><span>{records.length} aluno(s) registrados</span><strong>{percent(presents)}% presença · {percent(absences)}% ausência</strong></div><i><b style={{ width: `${percent(presents)}%` }}/></i></section>
      <div className="call-finished"><Check size={20}/><div><strong>Edição habilitada</strong><span>Clique no status de um aluno para corrigir a presença. A alteração é salva automaticamente.</span></div></div>
      <ReportAttendanceEditor sessionId={id} records={editorRecords}/>
    </div>
  </>;
}
