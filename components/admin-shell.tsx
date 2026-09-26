import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { Brand } from "./brand";
import { logout } from "@/app/admin/actions";

export function AdminShell({ children, adminName }: { children: React.ReactNode, adminName?: string | null }) {
  const name = adminName || "Administrador";
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <>
      <div className="mobile-topbar">
         <Brand compact />
         <div className="mobile-profile">
            <span>{name}</span>
            <div className="mobile-avatar">{initials}</div>
         </div>
      </div>
      <div className="admin-shell">
        <aside className="admin-nav">
          <Brand />
          <div className="desktop-user-card">
             <div className="user-avatar">{initials}</div>
             <div className="user-copy">
               <div className="user-name">{name}</div>
               <div className="user-role">Administrador</div>
             </div>
             <ChevronDown className="user-chevron" size={15} />
          </div>
          <nav className="nav-links" aria-label="Navegação administrativa">
            <Link className="nav-link active" href="/admin"><LayoutDashboard size={18}/><span>Visão geral</span></Link>
            <Link className="nav-link" href="/admin/inscricoes"><UsersRound size={18}/><span>Inscrições</span></Link>
            <form action={logout}>
              <button className="nav-link nav-logout"><LogOut size={18}/><span>Sair</span></button>
            </form>
          </nav>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </>
  );
}
