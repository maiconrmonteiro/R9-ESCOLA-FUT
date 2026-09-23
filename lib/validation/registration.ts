import { z } from "zod";

const optionalText = z.string().trim().max(240).optional().or(z.literal(""));
const phone = z.string().trim().min(10, "Informe um telefone válido").max(20);

export const registrationSchema = z.object({
  athleteName: z.string().trim().min(3, "Informe o nome completo").max(120),
  athleteNickname: optionalText,
  birthDate: z.string().date("Informe uma data válida"),
  athleteDocument: optionalText,
  naturality: optionalText,
  schoolName: optionalText,
  schoolGrade: optionalText,
  schoolShift: z.enum(["manha", "tarde", "noite", "integral", "nao_informado"]),
  zipCode: z.string().trim().max(10).optional(),
  street: z.string().trim().min(3, "Informe o endereço").max(160),
  number: z.string().trim().max(20).optional(),
  complement: optionalText,
  neighborhood: z.string().trim().min(2, "Informe o bairro").max(100),
  city: z.string().trim().min(2, "Informe a cidade").max(100),
  state: z.string().trim().length(2, "Use a sigla do estado"),
  motherName: optionalText,
  motherPhone: z.string().trim().max(20).optional(),
  fatherName: optionalText,
  fatherPhone: z.string().trim().max(20).optional(),
  guardianName: z.string().trim().min(3, "Informe o nome do responsável").max(120),
  guardianRelationship: z.string().trim().min(2, "Informe o vínculo").max(40),
  guardianPhone: phone,
  guardianEmail: z.string().trim().email("Informe um e-mail válido").max(160),
  weight: optionalText,
  height: optionalText,
  bloodType: optionalText,
  susCns: optionalText,
  hasHealthCondition: z.boolean(),
  healthConditionDetails: optionalText,
  continuousMedication: optionalText,
  vaccinationUpToDate: z.enum(["sim", "nao", "nao_sei"]),
  specialNeeds: optionalText,
  allergies: z.array(z.string().max(80)).max(12),
  otherAllergies: optionalText,
  termsAccepted: z.literal(true, { error: "É necessário aceitar o termo" }),
  imageConsent: z.boolean(),
  signerName: z.string().trim().min(3, "Digite o nome de quem confirma").max(120),
  honeypot: z.string().max(0).optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
