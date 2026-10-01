import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { EditableSection, type FieldDef } from "@/components/editable-section";
import { decideRegistration, updateInternalData } from "@/app/admin/actions";

export default async function RegistrationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("registrations").select("*").eq("id", id).single();
  if (!data) notFound();
  const row = data as Registration;
  const address = row.address ?? {};
  const family = row.family ?? {};
  const health = row.health ?? {};

  const identificationFields: FieldDef[] = [
    { label: "Nome completo", dbKey: "athlete_name", value: row.athlete_name },
    { label: "Apelido", dbKey: "athlete_nickname", value: row.athlete_nickname || "" },
    { label: "Nascimento", dbKey: "birth_date", value: row.birth_date, type: "date" },
    { label: "CPF / RG", dbKey: "athlete_document", value: row.athlete_document || "" },
    { label: "Naturalidade", dbKey: "naturality", value: row.naturality || "" },
    { label: "Escola", dbKey: "school_name", value: row.school_name || "" },
    { label: "Série", dbKey: "school_grade", value: row.school_grade || "" },
    { label: "Turno", dbKey: "school_shift", value: row.school_shift || "", type: "select", options: ["Manhã", "Tarde", "Noite", "Integral"] },
  ];

  const addressFamilyFields: FieldDef[] = [
    { label: "Rua", dbKey: "address.street", value: address.street || "" },
    { label: "Número", dbKey: "address.number", value: address.number || "" },
    { label: "Bairro", dbKey: "address.neighborhood", value: address.neighborhood || "" },
    { label: "Cidade", dbKey: "address.city", value: address.city || "" },
    { label: "Estado", dbKey: "address.state", value: address.state || "" },
    { label: "CEP", dbKey: "address.zip", value: address.zip || "" },
    { label: "Nome da mãe", dbKey: "family.motherName", value: family.motherName || "" },
    { label: "Telefone da mãe", dbKey: "family.motherPhone", value: family.motherPhone || "" },
    { label: "Nome do pai", dbKey: "family.fatherName", value: family.fatherName || "" },
    { label: "Telefone do pai", dbKey: "family.fatherPhone", value: family.fatherPhone || "" },
    { label: "Responsável legal", dbKey: "guardian_name", value: row.guardian_name },
    { label: "Parentesco", dbKey: "guardian_relationship", value: row.guardian_relationship },
    { label: "Telefone do responsável", dbKey: "guardian_phone", value: row.guardian_phone },
    { label: "E-mail do responsável", dbKey: "guardian_email", value: row.guardian_email },
  ];

  const healthFields: FieldDef[] = [
    { label: "Peso", dbKey: "health.weight", value: String(health.weight || "") },
    { label: "Altura", dbKey: "health.height", value: String(health.height || "") },
    { label: "Tipo sanguíneo", dbKey: "health.bloodType", value: String(health.bloodType || ""), type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { label: "SUS / CNS", dbKey: "health.susCns", value: String(health.susCns || "") },
    { label: "Vacinação em dia", dbKey: "health.vaccinationUpToDate", value: String(health.vaccinationUpToDate || ""), type: "select", options: ["Sim", "Não"] },
    { label: "Condição de saúde", dbKey: "health.healthConditionDetails", value: String(health.healthConditionDetails || ""), type: "textarea" },
    { label: "Medicamentos contínuos", dbKey: "health.continuousMedication", value: String(health.continuousMedication || ""), type: "textarea" },
    { label: "Necessidades especiais", dbKey: "health.specialNeeds", value: String(health.specialNeeds || ""), type: "textarea" },
    { label: "Alergias / restrições", dbKey: "health.otherAllergies", value: row.allergies?.join(", ") || String(health.otherAllergies || ""), type: "textarea" },
  ];

  return (
    <>
      <header className="page-head">
        <div>
          <Link
            href="/admin/inscricoes"
            style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--muted)", fontSize: 14, marginBottom: 14 }}
          >
            <ArrowLeft size={16} /> Voltar às inscrições
          </Link>
          <h1>{row.athlete_name}</h1>
          <p>Recebida em {formatDate(row.created_at)} · <StatusBadge status={row.status} /></p>
        </div>
      </header>

      <div className="detail-grid">
        <div>
          <EditableSection
            registrationId={row.id}
            title="Identificação do atleta"
            fields={identificationFields}
          />

          <EditableSection
            registrationId={row.id}
            title="Endereço e família"
            fields={addressFamilyFields}
          />

          <EditableSection
            registrationId={row.id}
            title="Saúde — acesso restrito"
            fields={healthFields}
          />

          <section className="card detail-card">
            <h2>Termo e consentimentos</h2>
            <div className="data-grid">
              <div className="data-item">
                <span>Versão</span>
                <strong>{row.terms_version}</strong>
              </div>
              <div className="data-item">
                <span>Confirmado em</span>
                <strong>{formatDate(row.accepted_at)}</strong>
              </div>
              <div className="data-item">
                <span>Termo de responsabilidade</span>
                <strong>{row.responsibility_accepted ? "Aceito" : "Não aceito"}</strong>
              </div>
              <div className="data-item">
                <span>Uso de imagem</span>
                <strong>{row.image_consent ? "Autorizado" : "Não autorizado"}</strong>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <section className="card detail-card">
            <h2>Decisão</h2>
            <StatusBadge status={row.status} />
            {row.status === "pending" && (
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                <form action={decideRegistration}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="btn btn-primary" style={{ width: "100%" }}>Aprovar atleta</button>
                </form>
                <form action={decideRegistration}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <div className="field">
                    <label htmlFor="reason">Motivo interno (opcional)</label>
                    <textarea id="reason" name="rejectionReason" />
                  </div>
                  <button className="btn btn-danger" style={{ width: "100%", marginTop: 10 }}>Recusar inscrição</button>
                </form>
              </div>
            )}
            {row.decided_at && (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>
                Decisão registrada em {formatDate(row.decided_at)}.
              </p>
            )}
          </section>

          <form action={updateInternalData} className="card detail-card">
            <input type="hidden" name="id" value={row.id} />
            <h2>Dados da escola</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="field"><label>Matrícula</label><input name="enrollmentNumber" defaultValue={row.enrollment_number ?? ""} /></div>
              <div className="field"><label>Categoria</label><input name="category" defaultValue={row.category ?? ""} /></div>
              <div className="field"><label>Turma</label><input name="className" defaultValue={row.class_name ?? ""} /></div>
              <div className="field"><label>Dias</label><input name="trainingDays" defaultValue={row.training_days ?? ""} /></div>
              <div className="field"><label>Horário</label><input name="trainingTime" defaultValue={row.training_time ?? ""} /></div>
              <div className="field"><label>Início</label><input type="date" name="startDate" defaultValue={row.start_date ?? ""} /></div>
              <button className="btn btn-secondary">Salvar dados internos</button>
            </div>
          </form>
        </aside>
      </div>
    </>
  );
}
