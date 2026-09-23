"use client";

import { useFormStatus } from "react-dom";

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending} onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>{pending ? "Salvando…" : children}</button>;
}
