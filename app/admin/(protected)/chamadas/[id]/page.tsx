import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AttendanceCall } from "@/components/attendance-call";
import { EditableCallDate } from "@/components/editable-call-date";
import "../call.css";

type Status = "C" | "F" | "FJ";
export default async function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient();
  const { data: session } = await supabase.from("attendance_sessions").select("id,session_date,session_status,notes,classes(id,name,shift,start_time,end_time)").eq("id", id).single();
  if (!session) notFound();
  const classData = session.classes as unknown as { id: string; name: string; shift: string; start_time: string; end_time: string };
  const [{ data: athletes }, { data: records }] = await Promise.all([
    supabase.from("registrations").select("id,athlete_name,athlete_nickname").eq("status", "approved").eq("class_id", classData.id).order("athlete_name"),
    supabase.from("attendance_records").select("registration_id,status").eq("session_id", id),
  ]);
  const initial = Object.fromEntries((records ?? []).filter(item => item.registration_id).map(item => [item.registration_id!, item.status as Status]));
  return <><header className="call-head"><Link href="/admin/chamadas"><ArrowLeft size={16}/> Voltar</Link><p>Chamada expressa</p><h1>{classData.name}</h1><div><span>{classData.shift}</span><EditableCallDate sessionId={id} initialDate={session.session_date}/><span><Clock3 size={15}/>{classData.start_time.slice(0,5)} às {classData.end_time.slice(0,5)}</span></div></header><AttendanceCall sessionId={id} athletes={athletes ?? []} initial={initial} finalized={session.session_status === "finalized"} initialNotes={session.notes ?? ""}/></>;
}
