"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(formData.get("email")), password: String(formData.get("password")) });
  if (error) redirect("/admin/login?erro=credenciais");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function decideRegistration(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !["approved", "rejected"].includes(status)) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { error } = await supabase.from("registrations").update({
    status,
    rejection_reason: status === "rejected" ? String(formData.get("rejectionReason") || "") || null : null,
    decided_at: new Date().toISOString(),
    decided_by: user.id,
  }).eq("id", id);
  if (!error) await supabase.from("registration_events").insert({ registration_id: id, actor_id: user.id, event_type: status, metadata: { reason: formData.get("rejectionReason") || null } });
  revalidatePath("/admin"); revalidatePath(`/admin/inscricoes/${id}`);
}

export async function updateInternalData(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const fields = { enrollment_number: formData.get("enrollmentNumber") || null, category: formData.get("category") || null, class_name: formData.get("className") || null, training_days: formData.get("trainingDays") || null, training_time: formData.get("trainingTime") || null, start_date: formData.get("startDate") || null };
  const { error } = await supabase.from("registrations").update(fields).eq("id", id);
  if (!error) await supabase.from("registration_events").insert({ registration_id: id, actor_id: user.id, event_type: "internal_data_updated", metadata: fields });
  revalidatePath(`/admin/inscricoes/${id}`);
}
