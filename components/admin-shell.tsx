import { ChevronDown } from "lucide-react";
import { Brand } from "./brand";
import { AdminNavLinks } from "./admin-nav-links";

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
          <AdminNavLinks />
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </>
  );
}
