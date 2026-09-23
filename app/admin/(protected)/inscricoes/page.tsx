import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration, RegistrationStatus } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const params = await searchParams; const page = Math.max(1, Number(params.page) || 1); const perPage = 15;
  let rows: Registration[] = []; let count = 0;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    let query = supabase.from("registrations").select("*", { count: "exact" });
    if (params.status && ["pending", "approved", "rejected"].includes(params.status)) query = query.eq("status", params.status);
    if (params.q?.trim()) query = query.ilike("athlete_name", `%${params.q.trim()}%`);
    const { data, count: total } = await query.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
    rows = (data ?? []) as Registration[]; count = total ?? 0;
  }
  return <><header className="page-head"><div><p className="eyebrow">Cadastros</p><h1>Inscrições</h1><p>Analise, filtre e acompanhe cada atleta.</p></div></header><section className="card section-card"><div className="section-head"><form className="toolbar"><div style={{position:"relative"}}><Search size={17} style={{position:"absolute",left:13,top:15,color:"#72827d"}}/><input className="search-input" style={{paddingLeft:40}} name="q" defaultValue={params.q} placeholder="Buscar por atleta"/></div><select className="search-input" name="status" defaultValue={params.status ?? ""}><option value="">Todos os status</option><option value="pending">Pendentes</option><option value="approved">Aprovadas</option><option value="rejected">Recusadas</option></select><button className="btn btn-secondary">Filtrar</button></form><span style={{fontSize:13,color:"var(--muted)"}}>{count} registro(s)</span></div>{rows.length ? <><div className="table-wrap"><table><thead><tr><th>Atleta</th><th>Responsável</th><th>Contato</th><th>Data</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="athlete-cell"><span className="avatar">{initials(row.athlete_name)}</span>{row.athlete_name}</div></td><td>{row.guardian_name}</td><td>{row.guardian_phone}</td><td>{formatDate(row.created_at)}</td><td><StatusBadge status={row.status as RegistrationStatus}/></td><td><Link href={`/admin/inscricoes/${row.id}`}><ArrowRight size={18}/></Link></td></tr>)}</tbody></table></div><div className="section-head"><span>Página {page} de {Math.max(1, Math.ceil(count/perPage))}</span><div className="toolbar">{page > 1 && <Link className="btn btn-secondary" href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&page=${page-1}`}>Anterior</Link>}{page * perPage < count && <Link className="btn btn-primary" href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&page=${page+1}`}>Próxima</Link>}</div></div></> : <div className="empty"><strong>Nenhum resultado</strong><p>Ajuste os filtros ou aguarde novas inscrições.</p></div>}</section></>;
}
