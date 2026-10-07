"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { supabase, user };
}

export async function startCall(formData: FormData) {
  const classId = String(formData.get("classId") || "");
  const sessionDate = String(formData.get("sessionDate") || "");
  if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) return;
  const { supabase, user } = await authenticatedClient();
  const { data: existing } = await supabase.from("attendance_sessions").select("id").eq("class_id", classId).eq("session_date", sessionDate).maybeSingle();
  if (existing) redirect(`/admin/chamadas/${existing.id}`);
  const { data, error } = await supabase.from("attendance_sessions").insert({ class_id: classId, session_date: sessionDate, session_status: "draft", taken_by: user.id }).select("id").single();
  if (error || !data) redirect("/admin/chamadas?erro=iniciar");
  redirect(`/admin/chamadas/${data.id}`);
}

export async function markAttendance(sessionId: string, registrationId: string, athleteName: string, status: "C" | "F" | "FJ") {
  const { supabase } = await authenticatedClient();
  const { data: existing } = await supabase.from("attendance_records").select("id").eq("session_id", sessionId).eq("registration_id", registrationId).maybeSingle();
  const operation = existing
    ? supabase.from("attendance_records").update({ status }).eq("id", existing.id)
    : supabase.from("attendance_records").insert({ session_id: sessionId, registration_id: registrationId, raw_athlete_name: athleteName, status, match_confidence: 1, needs_review: false });
  const { error } = await operation;
  if (!error) revalidatePath(`/admin/chamadas/${sessionId}`);
  return { ok: !error };
}

export async function markAllPresent(sessionId: string) {
  const { supabase } = await authenticatedClient();
  const { data: session } = await supabase.from("attendance_sessions").select("class_id").eq("id", sessionId).single();
  if (!session) return { ok: false };
  const { data: athletes } = await supabase.from("registrations").select("id,athlete_name").eq("status", "approved").eq("class_id", session.class_id);
  const { data: existing } = await supabase.from("attendance_records").select("id,registration_id").eq("session_id", sessionId);
  const existingIds = new Set((existing ?? []).map(item => item.registration_id));
  if (existing?.length) await supabase.from("attendance_records").update({ status: "C" }).eq("session_id", sessionId);
  const missing = (athletes ?? []).filter(item => !existingIds.has(item.id)).map(item => ({ session_id: sessionId, registration_id: item.id, raw_athlete_name: item.athlete_name, status: "C" as const, match_confidence: 1, needs_review: false }));
  const { error } = missing.length ? await supabase.from("attendance_records").insert(missing) : { error: null };
  revalidatePath(`/admin/chamadas/${sessionId}`);
  return { ok: !error };
}

export async function finalizeCall(sessionId: string, notes: string, sessionDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) return { ok: false, error: "Informe uma data válida para finalizar a chamada." };
  const { supabase } = await authenticatedClient();
  const { data: session } = await supabase.from("attendance_sessions").select("class_id").eq("id", sessionId).single();
  if (!session) return { ok: false, error: "Chamada não encontrada." };
  const [{ count: athleteCount }, { count: recordCount }] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "approved").eq("class_id", session.class_id),
    supabase.from("attendance_records").select("id", { count: "exact", head: true }).eq("session_id", sessionId),
  ]);
  if ((recordCount ?? 0) < (athleteCount ?? 0)) return { ok: false, error: `Ainda existem ${(athleteCount ?? 0) - (recordCount ?? 0)} atleta(s) sem marcação.` };
  const { error } = await supabase.from("attendance_sessions").update({ session_date: sessionDate, session_status: "finalized", finalized_at: new Date().toISOString(), notes: notes.trim() || null }).eq("id", sessionId);
  if (error?.code === "23505") return { ok: false, error: "Já existe uma chamada desta turma nessa data." };
  if (error) return { ok: false, error: "Não foi possível finalizar a chamada." };
  revalidatePath("/admin"); revalidatePath("/admin/chamadas"); revalidatePath("/admin/relatorios/presencas");
  return { ok: true };
}

export async function updateCallDate(sessionId: string, sessionDate: string) {
  if (!sessionId || !/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) return { ok: false, error: "Data inválida." };
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("attendance_sessions").update({ session_date: sessionDate }).eq("id", sessionId);
  if (error?.code === "23505") return { ok: false, error: "Já existe uma chamada desta turma nessa data." };
  if (error) return { ok: false, error: "Não foi possível alterar a data." };
  revalidatePath(`/admin/chamadas/${sessionId}`); revalidatePath("/admin/chamadas"); revalidatePath("/admin/relatorios/presencas"); revalidatePath("/admin");
  return { ok: true };
}
