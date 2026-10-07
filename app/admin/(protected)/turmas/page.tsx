import Link from "next/link";
import { CalendarDays, Clock3, Pencil, Plus, Trash2, UserMinus, UserPlus, UsersRound } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { AthleteKpiModal } from "@/components/athlete-kpi-modal";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { assignAthlete, createClass, deleteClass, removeAthlete, updateClass } from "./actions";
import styles from "./turmas.module.css";

type ClassRow = { id: string; name: string; shift: "Matutino" | "Vespertino"; training_days: string; start_time: string; end_time: string };
type AthleteRow = { id: string; athlete_name: string; class_id: string | null; status: string };

const messages: Record<string, string> = {
  dados_invalidos: "Revise os dados. O horário final deve ser posterior ao inicial.",
  duplicada: "Já existe uma turma com esses mesmos dados e horários.",
  salvar: "Não foi possível salvar a turma.",
  excluir: "Não foi possível excluir a turma.",
  vincular: "Não foi possível vincular o atleta à turma.",
  remover_vinculo: "Não foi possível remover o atleta da turma.",
};

function time(value: string) { return value.slice(0, 5); }

function ClassFields({ row }: { row?: ClassRow }) {
  return <div className={styles.formGrid}>
    <label className={`field ${styles.nameField}`}><span>Turma / faixa etária</span><input name="name" required minLength={3} maxLength={100} defaultValue={row?.name} placeholder="Ex.: Sub 10 ao Sub 13" /></label>
    <label className="field"><span>Turno</span><select name="shift" required defaultValue={row?.shift ?? "Matutino"}><option>Matutino</option><option>Vespertino</option></select></label>
    <label className={`field ${styles.daysField}`}><span>Dias de treino</span><input name="trainingDays" required minLength={3} maxLength={100} defaultValue={row?.training_days} placeholder="Ex.: Terça e Quinta-feira" /></label>
    <label className="field"><span>Início</span><input name="startTime" type="time" required defaultValue={row ? time(row.start_time) : ""} /></label>
    <label className="field"><span>Término</span><input name="endTime" type="time" required defaultValue={row ? time(row.end_time) : ""} /></label>
  </div>;
}

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const params = await searchParams;
  let rows: ClassRow[] = [];
  let athletes: AthleteRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("classes").select("id,name,shift,training_days,start_time,end_time").order("start_time");
    rows = (data ?? []) as ClassRow[];
    const { data: athleteData } = await supabase.from("registrations").select("id,athlete_name,class_id,status").eq("status", "approved").order("athlete_name");
    athletes = (athleteData ?? []) as AthleteRow[];
  }
  const unlinkedAthletes = athletes.filter(athlete => !athlete.class_id).length;
  const classNames = new Map(rows.map(row => [row.id, `${row.name} — ${row.shift}`]));

  return <>
    <header className="page-head">
      <div><p className="eyebrow">Cadastros</p><h1>Turmas</h1><p>Organize as categorias, dias e horários de treinamento.</p></div>
      <a href="#nova-turma" className="btn btn-primary"><Plus size={18}/> Nova turma</a>
    </header>

    {params.erro && <div className={`${styles.feedback} ${styles.error}`} role="alert">{messages[params.erro] ?? messages.salvar}</div>}
    {params.sucesso && <div className={`${styles.feedback} ${styles.success}`} role="status">Turma {params.sucesso} com sucesso.</div>}

    <section className={styles.summary} aria-label="Resumo das turmas">
      <div><span className={styles.summaryIcon}><UsersRound size={20}/></span><strong>{rows.length}</strong><small>turmas cadastradas</small></div>
      <div><span className={styles.summaryIcon}><CalendarDays size={20}/></span><strong>{new Set(rows.map(row => row.training_days)).size}</strong><small>rotinas de treino</small></div>
      <AthleteKpiModal title="Atletas vinculados" label="atletas vinculados" tone="linked" athletes={athletes.filter(athlete => athlete.class_id).map(athlete => ({ id: athlete.id, name: athlete.athlete_name, detail: classNames.get(athlete.class_id!) ?? "Turma vinculada" }))}/>
      <AthleteKpiModal title="Atletas sem turma" label="atletas sem turma" tone={unlinkedAthletes > 0 ? "pending" : "linked"} athletes={athletes.filter(athlete => !athlete.class_id).map(athlete => ({ id: athlete.id, name: athlete.athlete_name, detail: "Aguardando vínculo com uma turma" }))}/>
    </section>

    <section className={styles.list}>
      {rows.map(row => <article className={styles.classCard} key={row.id}>
        <div className={styles.classMain}>
          <span className={styles.shift}>{row.shift}</span>
          <h2>{row.name}</h2>
          <div className={styles.schedule}><span><CalendarDays size={16}/>{row.training_days}</span><span><Clock3 size={16}/>{time(row.start_time)} às {time(row.end_time)}</span></div>
        </div>
        <div className={styles.cardActions}>
          <details className={styles.editDetails}><summary className="btn btn-secondary"><Pencil size={16}/> Editar</summary><form action={updateClass} className={styles.editForm}><input type="hidden" name="id" value={row.id}/><ClassFields row={row}/><div className={styles.formActions}><button className="btn btn-primary">Salvar alterações</button></div></form></details>
          <form action={deleteClass}><input type="hidden" name="id" value={row.id}/><ConfirmButton className={styles.deleteButton} message={`Excluir a turma ${row.name} (${row.shift})?`}><Trash2 size={16}/> Excluir</ConfirmButton></form>
        </div>
        <details className={styles.roster}>
          <summary><UsersRound size={17}/> Atletas vinculados <span>{athletes.filter(athlete => athlete.class_id === row.id).length}</span></summary>
          <div className={styles.rosterBody}>
            <form action={assignAthlete} className={styles.assignForm}>
              <input type="hidden" name="classId" value={row.id}/>
              <label className="field"><span>Adicionar ou transferir atleta</span><select name="registrationId" required defaultValue=""><option value="" disabled>Selecione um atleta aprovado</option>{athletes.filter(athlete => athlete.class_id !== row.id).map(athlete => <option key={athlete.id} value={athlete.id}>{athlete.athlete_name}{athlete.class_id ? " — transferir" : ""}</option>)}</select></label>
              <button className="btn btn-primary"><UserPlus size={16}/> Vincular</button>
            </form>
            <div className={styles.athleteList}>
              {athletes.filter(athlete => athlete.class_id === row.id).map(athlete => <div key={athlete.id}>
                <Link href={`/admin/inscricoes/${athlete.id}`}>{athlete.athlete_name}</Link>
                <form action={removeAthlete}><input type="hidden" name="registrationId" value={athlete.id}/><ConfirmButton className={styles.unlinkButton} message={`Remover ${athlete.athlete_name} desta turma?`}><UserMinus size={15}/> Remover</ConfirmButton></form>
              </div>)}
              {!athletes.some(athlete => athlete.class_id === row.id) && <p>Nenhum atleta vinculado a esta turma.</p>}
            </div>
          </div>
        </details>
      </article>)}
      {!rows.length && <div className="empty"><strong>Nenhuma turma cadastrada</strong><p>Inclua a primeira turma usando o formulário abaixo.</p></div>}
    </section>

    <section id="nova-turma" className={`card ${styles.newCard}`}>
      <div><p className="section-kicker">Novo cadastro</p><h2>Incluir turma</h2><p>Informe a categoria, o turno e a agenda de treinamento.</p></div>
      <form action={createClass}><ClassFields/><div className={styles.formActions}><button className="btn btn-primary"><Plus size={17}/> Cadastrar turma</button></div></form>
    </section>
  </>;
}
