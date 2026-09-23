export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Escola de Futebol RS9">
      <span className="brand-mark" aria-hidden="true">RS9</span>
      {!compact && <span>Escola de Futebol<small>Centro de aprimoramento</small></span>}
    </div>
  );
}
