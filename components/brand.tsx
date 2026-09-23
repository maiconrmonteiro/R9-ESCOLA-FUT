import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Escola de Futebol RS9">
      <Image className="brand-logo" src="/logo-rs9.png" alt="Logo da Escola de Futebol RS9" width={52} height={52} priority />
      {!compact && <span>Escola de Futebol<small>Centro de aprimoramento</small></span>}
    </div>
  );
}
