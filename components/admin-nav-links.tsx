"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarRange, ChevronDown, ClipboardCheck, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { logout } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/inscricoes", label: "Inscrições", icon: UsersRound },
  { href: "/admin/turmas", label: "Turmas", icon: CalendarRange },
  { href: "/admin/chamadas", label: "Chamadas", icon: CalendarCheck },
];

export function AdminNavLinks() {
  const pathname = usePathname();
  return <nav className="nav-links" aria-label="Navegação administrativa">
    {links.map(({ href, label, icon: Icon, exact }) => {
      const active = exact ? pathname === href : pathname.startsWith(href);
      return <Link key={href} className={`nav-link${active ? " active" : ""}`} href={href}><Icon size={18}/><span>{label}</span></Link>;
    })}
    <details className="nav-group" open={pathname.startsWith("/admin/relatorios") ? true : undefined}>
      <summary className={`nav-link${pathname.startsWith("/admin/relatorios") ? " active" : ""}`}>
        <ClipboardCheck size={18}/><span>Relatórios</span><ChevronDown className="nav-group-chevron" size={15}/>
      </summary>
      <div className="nav-submenu">
        <Link className={`nav-sublink${pathname === "/admin/relatorios/presencas" ? " active" : ""}`} href="/admin/relatorios/presencas">
          <span className="nav-submenu-dot"/>Presenças
        </Link>
      </div>
    </details>
    <form action={logout}><button className="nav-link nav-logout"><LogOut size={18}/><span>Sair</span></button></form>
  </nav>;
}
