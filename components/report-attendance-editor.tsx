"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateAttendanceStatus } from "@/app/admin/(protected)/relatorios/presencas/actions";

type Status = "C" | "F" | "FJ";
type RecordItem = { id: string; name: string; status: Status };

export function ReportAttendanceEditor({ sessionId, records }: { sessionId: string; records: RecordItem[] }) {
  const [items, setItems] = useState(records);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(record: RecordItem, status: Status) {
    if (record.status === status) return;
    const previous = record.status;
    setSavingId(record.id);
    setMessage("");
    setItems(current => current.map(item => item.id === record.id ? { ...item, status } : item));
    startTransition(async () => {
      const result = await updateAttendanceStatus(record.id, sessionId, status);
      if (!result.ok) {
        setItems(current => current.map(item => item.id === record.id ? { ...item, status: previous } : item));
        setMessage("Não foi possível salvar a alteração. Tente novamente.");
      }
      setSavingId("");
    });
  }

  return <>
    {message && <div className="call-message">{message}</div>}
    <section className="call-list">{items.map((record, index) => <article className={`call-athlete marked-${record.status}`} key={record.id}>
      <span className="call-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="call-name"><strong>{record.name}</strong></div>
      <div className="call-statuses">
        <button disabled={isPending && savingId === record.id} className={record.status === "C" ? "selected present" : ""} onClick={() => update(record, "C")}>{savingId === record.id ? <Loader2 className="call-spinner" size={16}/> : <Check size={16}/>}<span>Presente</span></button>
        <button disabled={isPending && savingId === record.id} className={record.status === "F" ? "selected absent" : ""} onClick={() => update(record, "F")}><b>F</b><span>Falta</span></button>
        <button disabled={isPending && savingId === record.id} className={record.status === "FJ" ? "selected justified" : ""} onClick={() => update(record, "FJ")}><b>FJ</b><span>Justificada</span></button>
      </div>
    </article>)}{!items.length && <div className="call-empty">Nenhum aluno registrado nesta chamada.</div>}</section>
  </>;
}
