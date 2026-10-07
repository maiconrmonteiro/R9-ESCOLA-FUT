"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Check, Loader2, Pencil, X } from "lucide-react";
import { updateCallDate } from "@/app/admin/(protected)/chamadas/actions";

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)); }

export function EditableCallDate({ sessionId, initialDate, onDateChange }: { sessionId: string; initialDate: string; onDateChange?: (date: string) => void }) {
  const [editing, setEditing] = useState(false); const [date, setDate] = useState(initialDate); const [draft, setDraft] = useState(initialDate); const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  function save() { startTransition(async () => { const result = await updateCallDate(sessionId, draft); if (result.ok) { setDate(draft); onDateChange?.(draft); setEditing(false); setError(""); } else setError(result.error ?? "Não foi possível alterar."); }); }
  if (!editing) return <button type="button" className="call-date-button" onClick={() => setEditing(true)} title="Alterar data da chamada"><CalendarDays size={15}/>{formatDate(date)}<Pencil size={13}/></button>;
  return <span className="call-date-editor"><span><input type="date" value={draft} onChange={event => { setDraft(event.target.value); onDateChange?.(event.target.value); }} autoFocus/><button type="button" onClick={save} disabled={pending || !draft} aria-label="Salvar data">{pending ? <Loader2 className="call-spinner" size={15}/> : <Check size={15}/>}</button><button type="button" onClick={() => { setDraft(date); onDateChange?.(date); setEditing(false); setError(""); }} disabled={pending} aria-label="Cancelar"><X size={15}/></button></span>{error && <small>{error}</small>}</span>;
}
