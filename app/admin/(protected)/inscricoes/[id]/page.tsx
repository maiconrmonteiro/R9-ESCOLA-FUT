import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, RotateCcw } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Registration } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { EditableSection, type FieldDef } from "@/components/editable-section";
import { archiveRegistration, rejectRegistration, restoreRegistration } from "@/app/admin/actions";
import { ApprovalConfirmation } from "@/components/approval-confirmation";
import { ConfirmButton } from "@/components/confirm-button";

export default async function RegistrationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("registrations").select("*").eq("id", id).single();
  if (!data) notFound();
  const { data: classesData } = await supabase.from("classes").select("id,name,shift,training_days,start_time,end_time").order("name");
  const classes = classesData ?? [];
  const row = data as Registration;
  const isArchived = Boolean(row.archived_at);
  const address = row.address ?? {};
  const family = row.family ?? {};
  const health = row.health ?? {};

  const identificationFields: FieldDef[] = [
    { label: "Nome completo", dbKey: "athlete_name", value: titleCase(row.athlete_name) },
    { label: "Apelido", dbKey: "athlete_nickname", value: titleCase(row.athlete_nickname || "") },
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
    { label: "Nome da mãe", dbKey: "family.motherName", value: titleCase(family.motherName || "") },
    { label: "Telefone da mãe", dbKey: "family.motherPhone", value: family.motherPhone || "" },
    { label: "Nome do pai", dbKey: "family.fatherName", value: titleCase(family.fatherName || "") },
    { label: "Telefone do pai", dbKey: "family.fatherPhone", value: family.fatherPhone || "" },
    { label: "Responsável legal", dbKey: "guardian_name", value: titleCase(row.guardian_name) },
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
          <h1>{titleCase(row.athlete_name)}</h1>
          <p>Recebida em {formatDate(row.created_at)} · <StatusBadge status={row.status} /></p>
        </div>
      </header>

      <div className="detail-grid">
        <div>
          <EditableSection
            registrationId={row.id}
            title="Identificação do atleta"
            fields={identificationFields}
            readOnly={isArchived}
          />

          <EditableSection
            registrationId={row.id}
            title="Endereço e família"
            fields={addressFamilyFields}
            readOnly={isArchived}
          />

          <EditableSection
            registrationId={row.id}
            title="Saúde — acesso restrito"
            fields={healthFields}
            readOnly={isArchived}
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
            <StatusBadge status={isArchived ? "archived" : row.status} />
            {query.sucesso === "restaurada" && <p role="status" style={{ color: "#126044", fontWeight: 700 }}>Inscrição restaurada com sucesso.</p>}
            {query.erro && <p role="alert" style={{ color: "#903636", fontWeight: 700 }}>Não foi possível concluir a ação.</p>}
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "12px 0 0" }}>
              Matrícula <strong style={{ color: "var(--ink)" }}>{row.enrollment_number ?? "aguardando geração"}</strong>
            </p>
            <div style={{ marginTop: 18 }}>
              <ApprovalConfirmation
                canApprove={!isArchived && row.status !== "approved"}
                registrationId={row.id}
                athleteName={titleCase(row.athlete_name)}
                guardianName={titleCase(row.guardian_name)}
                guardianPhone={row.guardian_phone}
                initialClassId={row.class_id}
                classes={classes}
              />
            </div>
            {!isArchived && row.status === "pending" && (
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                <form action={rejectRegistration}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <div className="field">
                    <label htmlFor="reason">Motivo interno (opcional)</label>
                    <textarea id="reason" name="rejectionReason" />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <ConfirmButton
                      className="btn btn-danger"
                      title="Recusar esta inscrição?"
                      confirmLabel="Recusar inscrição"
                      message={`Você está prestes a recusar a inscrição de ${titleCase(row.athlete_name)}.`}
                    >
                      Recusar inscrição
                    </ConfirmButton>
                  </div>
                </form>
              </div>
            )}
            {row.decided_at && (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>
                Decisão registrada em {formatDate(row.decided_at)}.
              </p>
            )}
          </section>

          <section className="card detail-card" style={{ marginTop: 18 }}>
            {isArchived ? <>
              <h2>Inscrição arquivada</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                Arquivada em {formatDate(row.archived_at!)}. A ficha, matrícula, eventos e chamadas foram preservados.
              </p>
              {row.archived_reason && <p style={{ fontSize: 13 }}><strong>Motivo:</strong> {row.archived_reason}</p>}
              <form action={restoreRegistration}>
                <input type="hidden" name="id" value={row.id} />
                <ConfirmButton
                  className="btn btn-primary"
                  confirmClassName="btn btn-primary"
                  title="Restaurar esta inscrição?"
                  confirmLabel="Restaurar inscrição"
                  warning="O atleta voltará a aparecer nas turmas, chamadas e relatórios."
                  message={`A inscrição de ${titleCase(row.athlete_name)} será reativada com a mesma matrícula e histórico.`}
                >
                  <RotateCcw size={16} /> Restaurar inscrição
                </ConfirmButton>
              </form>
            </> : <>
              <h2>Arquivar inscrição</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                Retira o atleta das listas e chamadas sem apagar sua ficha, matrícula ou histórico. A inscrição poderá ser restaurada.
              </p>
              <form action={archiveRegistration}>
                <input type="hidden" name="id" value={row.id} />
                <div className="field" style={{ marginBottom: 10 }}>
                  <label htmlFor="archiveReason">Motivo do arquivamento (opcional)</label>
                  <textarea id="archiveReason" name="archiveReason" maxLength={500} />
                </div>
                <ConfirmButton
                  className="btn btn-danger"
                  title="Arquivar esta inscrição?"
                  confirmLabel="Arquivar inscrição"
                  warning="A ficha e todo o histórico serão preservados e poderão ser restaurados."
                  message={`A inscrição de ${titleCase(row.athlete_name)} deixará de aparecer nas listas operacionais.`}
                >
                  <Archive size={16} /> Arquivar inscrição
                </ConfirmButton>
              </form>
            </>}
          </section>

        </aside>
      </div>
    </>
  );
}
