"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { registrationSchema, type RegistrationInput } from "@/lib/validation/registration";

const steps = ["Atleta", "Família", "Saúde", "Termo", "Revisão"];
const allergyOptions = ["Leite e lactose", "Glúten", "Picada de insetos", "Pelos de animais", "Poeira", "Respiratória", "Hipertensão", "Diabetes"];

const defaults: RegistrationInput = {
  athleteName: "", athleteNickname: "", birthDate: "", athleteDocument: "", naturality: "", schoolName: "", schoolGrade: "", schoolShift: "nao_informado",
  zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  motherName: "", motherPhone: "", fatherName: "", fatherPhone: "", guardianName: "", guardianRelationship: "", guardianPhone: "", guardianEmail: "",
  weight: "", height: "", bloodType: "", susCns: "", hasHealthCondition: false, healthConditionDetails: "", continuousMedication: "", vaccinationUpToDate: "nao_sei", specialNeeds: "", allergies: [], otherAllergies: "",
  termsAccepted: false as true, imageConsent: false, signerName: "", honeypot: "",
};

const stepFields: Array<Array<keyof RegistrationInput>> = [
  ["athleteName", "birthDate", "schoolShift", "street", "neighborhood", "city", "state"],
  ["guardianName", "guardianRelationship", "guardianPhone", "guardianEmail"],
  ["vaccinationUpToDate"],
  ["termsAccepted", "signerName"],
  [],
];

function ageFrom(date: string) {
  if (!date) return null;
  const birth = new Date(`${date}T12:00:00`); const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return <div className={`field${full ? " full" : ""}`}><label>{label}</label>{children}{error && <span className="error">{error}</span>}</div>;
}

export function RegistrationForm({ adminMode = false }: { adminMode?: boolean }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), defaultValues: defaults, mode: "onTouched" });
  const values = watch();
  const age = useMemo(() => ageFrom(values.birthDate), [values.birthDate]);

  async function next() {
    const valid = await trigger(stepFields[step]);
    if (valid) { setStep((current) => Math.min(4, current + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  async function submit(data: RegistrationInput) {
    setServerError("");
    const response = await fetch("/api/registrations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { setServerError(result.message ?? "Não foi possível enviar. Tente novamente."); return; }
    setDone(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) return <div className="card success"><div className="success-icon"><Check size={34}/></div><h2>Inscrição cadastrada</h2><p className="form-help">{adminMode ? "O cadastro foi salvo e já está disponível na fila de análise do painel." : "Os dados foram enviados com segurança e aguardam a análise da equipe RS9. A escola entrará em contato pelos dados informados."}</p><div className="notice">A inscrição foi registrada como <strong>pendente</strong> e ainda precisa ser analisada.</div>{adminMode && <a className="btn btn-primary" style={{marginTop:20}} href="/admin/inscricoes">Voltar às inscrições</a>}</div>;

  return (
    <form className="card form-card" onSubmit={handleSubmit(submit)} noValidate>
      <div className="progress" aria-label={`Etapa ${step + 1} de 5`}>
        {steps.map((name, index) => <div key={name} data-step={index + 1} className={`progress-step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}>{name}</div>)}
      </div>
      <div className="form-body">
        {step === 0 && <>
          <h2 className="form-title">Dados do atleta</h2><p className="form-help">Identificação, escola e endereço residencial.</p>
          <div className="field-grid">
            <Field label="Nome completo *" error={errors.athleteName?.message} full><input autoComplete="name" {...register("athleteName")}/></Field>
            <Field label="Como gosta de ser chamado"><input {...register("athleteNickname")}/></Field>
            <Field label="Data de nascimento *" error={errors.birthDate?.message}><input type="date" {...register("birthDate")}/>{age !== null && <small>{age} anos</small>}</Field>
            <Field label="CPF ou RG do atleta"><input inputMode="numeric" {...register("athleteDocument")}/></Field>
            <Field label="Naturalidade"><input placeholder="Cidade / UF" {...register("naturality")}/></Field>
            <Field label="Escola"><input {...register("schoolName")}/></Field>
            <Field label="Série"><input {...register("schoolGrade")}/></Field>
            <Field label="Turno escolar"><select {...register("schoolShift")}><option value="nao_informado">Não informado</option><option value="manha">Manhã</option><option value="tarde">Tarde</option><option value="noite">Noite</option><option value="integral">Integral</option></select></Field>
            <Field label="CEP"><input inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" {...register("zipCode")}/></Field>
            <Field label="Rua / avenida *" error={errors.street?.message} full><input autoComplete="street-address" {...register("street")}/></Field>
            <Field label="Número"><input {...register("number")}/></Field><Field label="Complemento"><input {...register("complement")}/></Field>
            <Field label="Bairro *" error={errors.neighborhood?.message}><input {...register("neighborhood")}/></Field><Field label="Cidade *" error={errors.city?.message}><input {...register("city")}/></Field>
            <Field label="UF *" error={errors.state?.message}><input maxLength={2} autoCapitalize="characters" {...register("state")}/></Field>
          </div>
        </>}
        {step === 1 && <>
          <h2 className="form-title">Família e contato</h2><p className="form-help">Informe quem está enviando a inscrição. Dados do pai ou da mãe são opcionais quando não se aplicam.</p>
          <div className="field-grid">
            <Field label="Nome da mãe"><input {...register("motherName")}/></Field><Field label="Telefone da mãe"><input type="tel" inputMode="tel" {...register("motherPhone")}/></Field>
            <Field label="Nome do pai"><input {...register("fatherName")}/></Field><Field label="Telefone do pai"><input type="tel" inputMode="tel" {...register("fatherPhone")}/></Field>
            <Field label="Responsável legal *" error={errors.guardianName?.message} full><input autoComplete="name" {...register("guardianName")}/></Field>
            <Field label="Vínculo com o atleta *" error={errors.guardianRelationship?.message}><select {...register("guardianRelationship")}><option value="">Selecione</option><option>Mãe</option><option>Pai</option><option>Avó/avô</option><option>Tutor(a) legal</option><option>Outro responsável legal</option></select></Field>
            <Field label="Telefone principal *" error={errors.guardianPhone?.message}><input type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" {...register("guardianPhone")}/></Field>
            <Field label="E-mail *" error={errors.guardianEmail?.message} full><input type="email" inputMode="email" autoComplete="email" {...register("guardianEmail")}/></Field>
          </div>
        </>}
        {step === 2 && <>
          <h2 className="form-title">Saúde e cuidados</h2><p className="form-help">Essas informações são restritas e ajudam a equipe a cuidar do atleta.</p>
          <div className="field-grid">
            <Field label="Peso aproximado"><input inputMode="decimal" placeholder="kg" {...register("weight")}/></Field><Field label="Altura aproximada"><input inputMode="decimal" placeholder="m" {...register("height")}/></Field>
            <Field label="Tipo sanguíneo"><input placeholder="Se conhecido" {...register("bloodType")}/></Field><Field label="SUS / CNS"><input inputMode="numeric" {...register("susCns")}/></Field>
            <div className="field full"><span className="label">Possui problema de saúde?</span><label className="choice"><input type="checkbox" {...register("hasHealthCondition")}/> Sim</label></div>
            {values.hasHealthCondition && <Field label="Descreva o problema de saúde" full><textarea {...register("healthConditionDetails")}/></Field>}
            <Field label="Medicamentos de uso contínuo" full><textarea placeholder="Nome, dose e horário. Deixe em branco se não usa." {...register("continuousMedication")}/></Field>
            <Field label="Vacinação em dia? *"><select {...register("vaccinationUpToDate")}><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sei informar</option></select></Field>
            <Field label="Necessidades especiais"><input placeholder="Se houver" {...register("specialNeeds")}/></Field>
            <div className="field full"><span className="label">Restrições, intolerâncias e alergias</span><div className="choice-row">{allergyOptions.map((item) => <label className="choice" key={item}><input type="checkbox" checked={values.allergies.includes(item)} onChange={(event) => setValue("allergies", event.target.checked ? [...values.allergies, item] : values.allergies.filter((value) => value !== item))}/>{item}</label>)}</div></div>
            <Field label="Outras alergias ou restrições" full><input {...register("otherAllergies")}/></Field>
          </div>
        </>}
        {step === 3 && <>
          <h2 className="form-title">Termos e privacidade</h2><p className="form-help">Leia as condições e registre suas escolhas antes do envio.</p>
          <div className="notice"><strong>Texto em revisão administrativa</strong><br/>A cópia fotografada do termo atual não possui nitidez suficiente para publicação fiel. Antes do uso em produção, a escola deve inserir e aprovar a transcrição integral da versão vigente. Nenhuma cláusula foi presumida.</div>
          <div className="field" style={{marginTop: 20}}><label className="choice"><input type="checkbox" {...register("termsAccepted")}/> Li e confirmo o termo de responsabilidade apresentado acima. *</label>{errors.termsAccepted && <span className="error">{errors.termsAccepted.message}</span>}</div>
          <div className="field" style={{marginTop: 12}}><span className="label">Autorização de uso de imagem</span><label className="choice"><input type="checkbox" {...register("imageConsent")}/> Autorizo, de forma específica, o uso de imagem do atleta conforme o texto que será revisado pela escola.</label><small style={{color: "var(--muted)"}}>Esta escolha é opcional e não interfere no envio da inscrição.</small></div>
          <div className="field-grid" style={{marginTop: 20}}><Field label="Nome completo de quem confirma *" error={errors.signerName?.message} full><input {...register("signerName")}/></Field></div>
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-9999px"}} {...register("honeypot")}/>
        </>}
        {step === 4 && <>
          <h2 className="form-title">Revise antes de enviar</h2><p className="form-help">Confira os principais dados. Você pode voltar para corrigir qualquer etapa.</p>
          <div className="data-grid">
            <div className="data-item"><span>Atleta</span><strong>{values.athleteName}</strong></div><div className="data-item"><span>Nascimento</span><strong>{values.birthDate?.split("-").reverse().join("/")}</strong></div>
            <div className="data-item"><span>Responsável</span><strong>{values.guardianName} · {values.guardianRelationship}</strong></div><div className="data-item"><span>Contato</span><strong>{values.guardianPhone}<br/>{values.guardianEmail}</strong></div>
            <div className="data-item"><span>Endereço</span><strong>{values.street}, {values.number || "s/n"} · {values.city}/{values.state}</strong></div><div className="data-item"><span>Uso de imagem</span><strong>{values.imageConsent ? "Autorizado" : "Não autorizado"}</strong></div>
          </div>
          <div className="notice" style={{marginTop: 24}}>Ao enviar, a inscrição ficará com status <strong>pendente</strong> até a análise da RS9.</div>
          {serverError && <p className="error" role="alert" style={{marginTop: 16}}>{serverError}</p>}
        </>}
        <div className="actions">
          <button type="button" className="btn btn-secondary" disabled={step === 0 || isSubmitting} onClick={() => setStep((s) => s - 1)}><ArrowLeft size={17}/> Voltar</button>
          {step < 4 ? <button type="button" className="btn btn-primary" onClick={next}>Continuar <ArrowRight size={17}/></button> : <button type="submit" className="btn btn-gold" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle size={18}/> Enviando…</> : <>Enviar inscrição <Check size={18}/></>}</button>}
        </div>
      </div>
    </form>
  );
}
