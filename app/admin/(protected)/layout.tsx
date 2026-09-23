import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <AdminShell>{children}</AdminShell>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("admin_profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) { await supabase.auth.signOut(); redirect("/admin/login?erro=sem_acesso"); }
  return <AdminShell>{children}</AdminShell>;
}
