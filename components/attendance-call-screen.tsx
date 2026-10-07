"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { AttendanceCall } from "@/components/attendance-call";
import { EditableCallDate } from "@/components/editable-call-date";

type Status = "C" | "F" | "FJ";
type Athlete = { id: string; athlete_name: string; athlete_nickname: string | null };

export function AttendanceCallScreen({ sessionId, initialDate, className, shift, startTime, endTime, athletes, initial, finalized, initialNotes }: { sessionId: string; initialDate: string; className: string; shift: string; startTime: string; endTime: string; athletes: Athlete[]; initial: Record<string, Status>; finalized: boolean; initialNotes: string }) {
  const [sessionDate, setSessionDate] = useState(initialDate);

  return <>
    <header className="call-head"><Link href="/admin/chamadas"><ArrowLeft size={16}/> Voltar</Link><p>Chamada expressa</p><h1>{className}</h1><div><span>{shift}</span><EditableCallDate sessionId={sessionId} initialDate={initialDate} onDateChange={setSessionDate}/><span><Clock3 size={15}/>{startTime.slice(0,5)} às {endTime.slice(0,5)}</span></div></header>
    <AttendanceCall sessionId={sessionId} sessionDate={sessionDate} className={className} shift={shift} startTime={startTime} endTime={endTime} athletes={athletes} initial={initial} finalized={finalized} initialNotes={initialNotes}/>
  </>;
}
