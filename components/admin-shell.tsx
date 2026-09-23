import Link from "next/link";
import { LayoutDashboard, LogOut, PlusCircle, UsersRound } from "lucide-react";
import { Brand } from "./brand";
import { logout } from "@/app/admin/actions";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Brand />
        <nav className="nav-links" aria-label="Navegação administrativa">
          <Link className="nav-link active" href="/admin"><LayoutDashboard size={18}/><span>Visão geral</span></Link>
          <Link className="nav-link" href="/admin/inscricoes"><UsersRound size={18}/><span>Inscrições</span></Link>
          <Link className="nav-link" href="/admin/inscricoes/nova"><PlusCircle size={18}/><span>Nova inscrição</span></Link>
          <form action={logout}>
            <button className="nav-link" style={{border:0,width:"100%",background:"transparent"}}><LogOut size={18}/><span>Sair</span></button>
          </form>
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
