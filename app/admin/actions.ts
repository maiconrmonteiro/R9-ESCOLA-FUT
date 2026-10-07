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
  if (!id || !["approved", "rejected"].includes(status)) return { ok: false, error: "Decisão inválida." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const classId = status === "approved" ? String(formData.get("classId") || "") || null : undefined;
  if (status === "approved" && !classId) return { ok: false, error: "Selecione a turma do atleta antes de aprovar." };

  const { error } = await supabase.from("registrations").update({
    status,
    ...(status === "approved" ? { class_id: classId } : {}),
    rejection_reason: status === "rejected" ? String(formData.get("rejectionReason") || "") || null : null,
    decided_at: new Date().toISOString(),
    decided_by: user.id,
  }).eq("id", id);
  if (!error) await supabase.from("registration_events").insert({ registration_id: id, actor_id: user.id, event_type: status, metadata: { reason: formData.get("rejectionReason") || null } });
  revalidatePath("/admin"); revalidatePath(`/admin/inscricoes/${id}`);
  return error
    ? { ok: false, error: "Não foi possível registrar a decisão. Tente novamente." }
    : { ok: true };
}

export async function rejectRegistration(formData: FormData) {
  await decideRegistration(formData);
}

export async function updateRegistrationFields(formData: FormData) {
  const id = String(formData.get("id"));
  const fieldsJson = String(formData.get("fields") || "{}");
  if (!id) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  let incoming: Record<string, unknown>;
  try { incoming = JSON.parse(fieldsJson); } catch { return; }

  // Separate JSONB merge fields from flat columns
  const jsonbKeys = ["address", "family", "health"] as const;
  const flatUpdate: Record<string, unknown> = {};
  const jsonbMerges: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(incoming)) {
    if (jsonbKeys.includes(key as typeof jsonbKeys[number]) && typeof value === "object" && value !== null) {
      jsonbMerges[key] = value as Record<string, unknown>;
    } else {
      flatUpdate[key] = value;
    }
  }

  // If there are JSONB merges, fetch current row first
  if (Object.keys(jsonbMerges).length > 0) {
    const { data: current } = await supabase.from("registrations").select("address, family, health").eq("id", id).single();
    if (current) {
      for (const [key, partial] of Object.entries(jsonbMerges)) {
        const existing = (current as Record<string, unknown>)[key] as Record<string, unknown> ?? {};
        flatUpdate[key] = { ...existing, ...partial };
      }
    }
  }

  if (Object.keys(flatUpdate).length === 0) return;

  const { error } = await supabase.from("registrations").update(flatUpdate).eq("id", id);
  if (!error) {
    await supabase.from("registration_events").insert({
      registration_id: id,
      actor_id: user.id,
      event_type: "fields_updated",
      metadata: { updated_fields: Object.keys(flatUpdate) },
    });
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/inscricoes/${id}`);
}
