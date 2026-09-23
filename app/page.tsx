import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="construction-page">
      <div className="construction-glow" aria-hidden="true" />
      <header className="construction-header">
        <Image src="/logo-rs9.png" alt="Escola de Futebol RS9" width={82} height={82} priority />
        <span className="construction-name">Escola de Futebol RS9</span>
      </header>

      <section className="construction-content">
        <div className="construction-copy">
          <p className="construction-kicker"><span /> Novo site em preparação</p>
          <h1>Formando atletas.<br/><em>Construindo futuros.</em></h1>
          <p className="construction-text">Estamos preparando uma nova experiência digital para atletas, famílias e toda a comunidade RS9.</p>
          <div className="construction-actions">
            <Link className="construction-button construction-button-primary" href="/inscricao"><UserPlus size={19}/> Fazer inscrição <ArrowRight size={18}/></Link>
            <Link className="construction-admin-link" href="/admin/login"><LockKeyhole size={15}/> Acesso administrativo</Link>
          </div>
          <p className="construction-trust">Cadastro online · análise individual pela equipe RS9</p>
        </div>

        <div className="construction-emblem" aria-hidden="true">
          <div className="emblem-ring" />
          <Image src="/logo-rs9.png" alt="" width={520} height={520} priority />
        </div>
      </section>

      <footer className="construction-footer">
        <span>RS9 · Centro de Aprimoramento de Futebol</span>
        <span>Desenvolvimento de pequenos atletas</span>
      </footer>
    </main>
  );
}
