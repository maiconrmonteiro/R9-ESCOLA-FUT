"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, UserCheck, UserX, X } from "lucide-react";

type AthleteItem = { id: string; name: string; detail: string };

export function AthleteKpiModal({
  title,
  label,
  athletes,
  tone,
}: {
  title: string;
  label: string;
  athletes: AthleteItem[];
  tone: "linked" | "pending";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const Icon = tone === "linked" ? UserCheck : UserX;

  return <>
    <button type="button" className={`athlete-kpi athlete-kpi-${tone}`} onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog">
      <span className="athlete-kpi-icon"><Icon size={20}/></span>
      <strong>{athletes.length}</strong>
      <small>{label}</small>
    </button>

    <dialog ref={dialogRef} className="athlete-modal" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="athlete-modal-panel">
        <header>
          <div><span>Visão geral das turmas</span><h2>{title}</h2><p>{athletes.length} atleta(s)</p></div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar"><X size={20}/></button>
        </header>
        <div className="athlete-modal-list">
          {athletes.map(athlete => <div key={athlete.id}>
            <div><strong>{athlete.name}</strong><span>{athlete.detail}</span></div>
            <Link href={`/admin/inscricoes/${athlete.id}`} onClick={() => dialogRef.current?.close()}>Ver cadastro <ArrowRight size={15}/></Link>
          </div>)}
          {!athletes.length && <div className="athlete-modal-empty">Nenhum atleta nesta situação.</div>}
        </div>
      </div>
    </dialog>
  </>;
}
