import { Brand } from "@/components/brand";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const params = await searchParams;
  return <main className="login-wrap"><section className="login-brand"><Brand/><h1>Gestão cuidadosa, dentro e fora de campo.</h1><p>Acesse inscrições, dados de saúde e decisões administrativas em um ambiente restrito à equipe autorizada.</p></section><section className="login-panel"><form action={login} className="card login-card"><p className="eyebrow">Área restrita</p><h2>Entrar no painel</h2><p className="form-help">Use seu acesso administrativo RS9.</p>{params.erro && <p className="error" role="alert">E-mail ou senha inválidos.</p>}<div className="field" style={{marginTop: 18}}><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required/></div><div className="field" style={{marginTop: 16}}><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required/></div><button className="btn btn-primary" style={{width:"100%",marginTop:22}}>Entrar com segurança</button><p style={{fontSize:12,color:"var(--muted)",marginTop:18}}>Não há cadastro público de administradores. Acesso criado somente pela direção.</p></form></section></main>;
}
