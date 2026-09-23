import { LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { Brand } from "@/components/brand";
import { RegistrationForm } from "@/components/registration-form";

export default function RegistrationPage() {
  return (
    <div className="brand-shell">
      <header className="topbar"><Brand /><span style={{fontSize: 13, color: "#c8d8d3"}}>Inscrição de atleta</span></header>
      <main className="container public-main">
        <section>
          <p className="eyebrow">Temporada 2026</p>
          <h1>O próximo capítulo começa aqui.</h1>
          <p className="lead">Preencha os dados do pequeno atleta com calma. A equipe RS9 analisará a inscrição antes de confirmar a matrícula.</p>
          <RegistrationForm />
        </section>
        <aside className="card sidebar-card">
          <h2>Antes de começar</h2>
          <ul className="trust-list">
            <li className="trust-item"><span className="icon-dot"><Smartphone size={15}/></span><span>Leva cerca de 8 minutos e pode ser preenchido pelo celular.</span></li>
            <li className="trust-item"><span className="icon-dot"><LockKeyhole size={15}/></span><span>Documentos e informações de saúde têm acesso restrito à equipe autorizada.</span></li>
            <li className="trust-item"><span className="icon-dot"><ShieldCheck size={15}/></span><span>O envio não aprova a matrícula automaticamente. Você receberá contato da escola.</span></li>
          </ul>
          <div className="notice" style={{marginTop: 22}}>Tenha em mãos os dados de contato, endereço e saúde do atleta. Campos internos da escola serão definidos depois.</div>
        </aside>
      </main>
    </div>
  );
}
