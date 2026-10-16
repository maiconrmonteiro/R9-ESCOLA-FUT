"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import styles from "./confirm-button.module.css";

type Props = {
  children: React.ReactNode;
  message: string;
  className: string;
  title?: string;
  confirmLabel?: string;
};

export function ConfirmButton({ children, message, className, title = "Confirmar ação?", confirmLabel = "Confirmar" }: Props) {
  const { pending } = useFormStatus();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function confirm() {
    const form = dialogRef.current?.closest("form");
    dialogRef.current?.close();
    form?.requestSubmit();
  }

  return (
    <>
      <button type="button" className={className} disabled={pending} onClick={() => dialogRef.current?.showModal()}>
        {pending ? "Processando…" : children}
      </button>
      <dialog ref={dialogRef} className={styles.modal}>
        <div className={styles.panel}>
          <button type="button" className={styles.close} aria-label="Fechar" onClick={() => dialogRef.current?.close()}>
            <X size={19} />
          </button>
          <span className={styles.icon}><AlertTriangle size={27} /></span>
          <p className={styles.kicker}>Atenção</p>
          <h2>{title}</h2>
          <p className={styles.description}>{message}</p>
          <div className={styles.warning}>Esta ação não poderá ser desfeita.</div>
          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={confirm}>{confirmLabel}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
