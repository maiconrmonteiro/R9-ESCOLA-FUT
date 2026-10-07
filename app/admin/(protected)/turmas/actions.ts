"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function classFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const shift = String(formData.get("shift") || "");
  const trainingDays = String(formData.get("trainingDays") || "").trim();
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");

  if (name.length < 3 || trainingDays.length < 3 || !["Matutino", "Vespertino"].includes(shift) || !startTime || !endTime || endTime <= startTime) {
    return null;
  }
  return { name, shift, training_days: trainingDays, start_time: startTime, end_time: endTime };
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createClass(formData: FormData) {
  const fields = classFields(formData);
  if (!fields) redirect("/admin/turmas?erro=dados_invalidos");
  const supabase = await authenticatedClient();
  const { error } = await supabase.from("classes").insert(fields);
  if (error) redirect(`/admin/turmas?erro=${error.code === "23505" ? "duplicada" : "salvar"}`);
  revalidatePath("/admin/turmas");
  redirect("/admin/turmas?sucesso=criada");
}

export async function updateClass(formData: FormData) {
  const id = String(formData.get("id") || "");
  const fields = classFields(formData);
  if (!id || !fields) redirect("/admin/turmas?erro=dados_invalidos");
  const supabase = await authenticatedClient();
  const { error } = await supabase.from("classes").update(fields).eq("id", id);
  if (error) redirect(`/admin/turmas?erro=${error.code === "23505" ? "duplicada" : "salvar"}`);
  revalidatePath("/admin/turmas");
  redirect("/admin/turmas?sucesso=atualizada");
}

export async function deleteClass(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await authenticatedClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) redirect("/admin/turmas?erro=excluir");
  revalidatePath("/admin/turmas");
  redirect("/admin/turmas?sucesso=excluida");
}

export async function assignAthlete(formData: FormData) {
  const registrationId = String(formData.get("registrationId") || "");
  const classId = String(formData.get("classId") || "");
  if (!registrationId || !classId) return;
  const supabase = await authenticatedClient();
  const { error } = await supabase.from("registrations").update({ class_id: classId }).eq("id", registrationId);
  if (error) redirect("/admin/turmas?erro=vincular");
  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/inscricoes/${registrationId}`);
  redirect("/admin/turmas?sucesso=vinculada");
}

export async function removeAthlete(formData: FormData) {
  const registrationId = String(formData.get("registrationId") || "");
  if (!registrationId) return;
  const supabase = await authenticatedClient();
  const { error } = await supabase.from("registrations").update({ class_id: null }).eq("id", registrationId);
  if (error) redirect("/admin/turmas?erro=remover_vinculo");
  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/inscricoes/${registrationId}`);
  redirect("/admin/turmas?sucesso=desvinculada");
}
