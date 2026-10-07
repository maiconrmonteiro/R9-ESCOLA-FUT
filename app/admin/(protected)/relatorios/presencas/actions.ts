"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateAttendanceStatus(recordId: string, sessionId: string, status: "C" | "F" | "FJ") {
  if (!recordId || !sessionId || !["C", "F", "FJ"].includes(status)) return { ok: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { error } = await supabase.from("attendance_records").update({ status }).eq("id", recordId).eq("session_id", sessionId);
  if (!error) {
    revalidatePath(`/admin/relatorios/presencas/${sessionId}`);
    revalidatePath("/admin/relatorios/presencas");
    revalidatePath("/admin");
  }
  return { ok: !error };
}

export async function reviewAttendanceLink(formData: FormData) {
  const recordId = String(formData.get("recordId") || "");
  const selected = String(formData.get("registrationId") || "");
  if (!recordId || !selected) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const registrationId = selected === "__none__" ? null : selected;
  const { error } = await supabase.from("attendance_records").update({
    registration_id: registrationId,
    needs_review: false,
    match_confidence: registrationId ? 1 : null,
  }).eq("id", recordId);

  if (error) redirect("/admin/relatorios/presencas?erro=revisao");
  revalidatePath("/admin/relatorios/presencas");
  redirect("/admin/relatorios/presencas?sucesso=revisado");
}
