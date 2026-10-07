"use client";

import { useRef, useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { decideRegistration } from "@/app/admin/actions";

type ClassOption = {
  id: string;
  name: string;
  shift: string;
  training_days: string;
  start_time: string;
  end_time: string;
};

type Props = {
  registrationId: string;
  athleteName: string;
  guardianName: string;
  guardianPhone: string;
  initialClassId: string | null;
  classes: ClassOption[];
};

const time = (value: string) => value.slice(0, 5);

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function ApprovalConfirmation({ registrationId, athleteName, guardianName, guardianPhone, initialClassId, classes }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [classId, setClassId] = useState(initialClassId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const selectedClass = classes.find(item => item.id === classId);

  const message = selectedClass
    ? `Olá, ${guardianName}! Tudo bem?\n\nTemos uma ótima notícia: o cadastro do(a) aluno(a) *${athleteName}* foi aprovado na Escola de Futebol RS9! ⚽\n\n*Turma:* ${selectedClass.name} — ${selectedClass.shift}\n*Dias de treino:* ${selectedClass.training_days}\n*Horário:* ${time(selectedClass.start_time)} às ${time(selectedClass.end_time)}\n\nSeja bem-vindo(a) à família RS9! Em caso de dúvida, estamos à disposição.`
    : "";
  const whatsappUrl = `https://wa.me/${whatsappNumber(guardianPhone)}?text=${encodeURIComponent(message)}`;

  async function approve() {
    if (!selectedClass) {
      setError("Selecione a turma do atleta antes de aprovar.");
      return;
    }
    setPending(true);
    setError("");
    const formData = new FormData();
    formData.set("id", registrationId);
    formData.set("status", "approved");
    formData.set("classId", selectedClass.id);
    const result = await decideRegistration(formData);
    setPending(false);
    if (!result?.ok) {
      setError(result?.error ?? "Não foi possível aprovar o atleta.");
      return;
    }
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="approval-box">
        <label className="field">
          <span>Turma para aprovação</span>
          <select value={classId} onChange={event => { setClassId(event.target.value); setError(""); }}>
            <option value="">Selecione a turma</option>
            {classes.map(item => <option key={item.id} value={item.id}>{item.name} — {item.shift}</option>)}
          </select>
        </label>
        {selectedClass && <p className="approval-schedule">{selectedClass.training_days} · {time(selectedClass.start_time)} às {time(selectedClass.end_time)}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="button" className="btn btn-primary" disabled={pending} onClick={approve} style={{ width: "100%" }}>
          <Check size={17}/>{pending ? "Aprovando…" : "Aprovar atleta"}
        </button>
      </div>

      <dialog ref={dialogRef} className="approval-modal" onCancel={() => dialogRef.current?.close()}>
        <div className="approval-modal-panel">
          <button className="approval-modal-close" type="button" aria-label="Fechar" onClick={() => dialogRef.current?.close()}><X size={19}/></button>
          <span className="approval-modal-icon"><Check size={26}/></span>
          <p className="eyebrow">Cadastro aprovado</p>
          <h2>Enviar confirmação ao responsável?</h2>
          <p>A conversa de <strong>{guardianName}</strong> será aberta no WhatsApp com a mensagem pronta.</p>
          <div className="approval-message-preview">{message}</div>
          <div className="approval-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Agora não</button>
            <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => dialogRef.current?.close()}><MessageCircle size={18}/> Abrir WhatsApp</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
