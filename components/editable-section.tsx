"use client";

import { useState, useTransition, useRef } from "react";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { updateRegistrationFields } from "@/app/admin/actions";

export type FieldDef = {
  /** Label shown to the user */
  label: string;
  /** Key used in the DB column or JSONB path (e.g. "athlete_name" or "address.street") */
  dbKey: string;
  /** Current value */
  value: string;
  /** Input type (default: "text") */
  type?: "text" | "date" | "select" | "textarea";
  /** Options for select type */
  options?: string[];
  /** Whether this field spans the full width */
  full?: boolean;
};

type Props = {
  registrationId: string;
  title: string;
  fields: FieldDef[];
};

export function EditableSection({ registrationId, title, fields }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSave() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    // Build the fields object from form data
    const payload: Record<string, unknown> = {};

    for (const field of fields) {
      const rawValue = fd.get(field.dbKey) as string | null;
      const value = rawValue?.trim() || null;

      if (field.dbKey.includes(".")) {
        // Nested JSONB field, e.g. "address.street"
        const [parent, child] = field.dbKey.split(".");
        if (!payload[parent] || typeof payload[parent] !== "object") {
          payload[parent] = {};
        }
        (payload[parent] as Record<string, unknown>)[child] = value ?? "";
      } else {
        payload[field.dbKey] = value ?? "";
      }
    }

    const actionFd = new FormData();
    actionFd.set("id", registrationId);
    actionFd.set("fields", JSON.stringify(payload));

    startTransition(async () => {
      await updateRegistrationFields(actionFd);
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
    });
  }

  return (
    <section className="card detail-card" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {showSuccess && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 10px",
              borderRadius: 8,
              background: "#dcefe7",
              color: "#126044",
              fontSize: 12,
              fontWeight: 700,
              animation: "fadeIn .25s ease",
            }}>
              <Check size={14} /> Salvo
            </span>
          )}
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-edit-toggle"
              title="Editar seção"
            >
              <Pencil size={15} />
              <span>Editar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-edit-toggle btn-edit-cancel"
              title="Cancelar edição"
            >
              <X size={15} />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="data-grid">
          {fields.map((f) => (
            <div key={f.dbKey} className="data-item" style={f.full ? { gridColumn: "1 / -1" } : undefined}>
              <span>{f.label}</span>
              <strong>{f.value || "—"}</strong>
            </div>
          ))}
        </div>
      ) : (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <div className="data-grid" style={{ gap: "14px 20px" }}>
            {fields.map((f) => (
              <div key={f.dbKey} className="field" style={f.full ? { gridColumn: "1 / -1" } : undefined}>
                <label>{f.label}</label>
                {f.type === "select" ? (
                  <select name={f.dbKey} defaultValue={f.value || ""}>
                    <option value="">— Selecionar —</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea name={f.dbKey} defaultValue={f.value || ""} rows={3} />
                ) : (
                  <input
                    type={f.type || "text"}
                    name={f.dbKey}
                    defaultValue={f.value || ""}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isPending}
              style={{ minWidth: 140 }}
            >
              {isPending ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</>
              ) : (
                <><Check size={16} /> Salvar alterações</>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
