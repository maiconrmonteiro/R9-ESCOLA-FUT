import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/registration-form";

export default function NewRegistrationPage() {
  return <>
    <header className="page-head">
      <div>
        <Link href="/admin/inscricoes" style={{display:"inline-flex",gap:6,alignItems:"center",color:"var(--muted)",fontSize:14,marginBottom:14}}><ArrowLeft size={16}/> Voltar às inscrições</Link>
        <p className="eyebrow">Cadastro administrativo</p>
        <h1>Nova inscrição</h1>
        <p>Cadastre presencialmente uma ficha recebida pela escola.</p>
      </div>
    </header>
    <div style={{maxWidth:900}}><RegistrationForm adminMode /></div>
  </>;
}
