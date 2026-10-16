import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { registrationSchema } from "@/lib/validation/registration";
import { titleCase } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = registrationSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ message: "Revise os campos informados." }, { status: 400 });
    if (parsed.data.honeypot) return NextResponse.json({ message: "Não foi possível processar." }, { status: 400 });
    if (!isSupabaseConfigured()) return NextResponse.json({ message: "O serviço ainda não foi configurado pela escola." }, { status: 503 });

    const d = parsed.data;
    const supabase = await createClient();
    const registration = {
      athlete_name: titleCase(d.athleteName),
      athlete_nickname: d.athleteNickname ? titleCase(d.athleteNickname) : null,
      birth_date: d.birthDate,
      athlete_document: d.athleteDocument || null,
      naturality: d.naturality || null,
      school_name: d.schoolName || null,
      school_grade: d.schoolGrade || null,
      school_shift: d.schoolShift,
      address: { zipCode: d.zipCode, street: d.street, number: d.number, complement: d.complement, neighborhood: d.neighborhood, city: d.city, state: d.state.toUpperCase() },
      family: { motherName: titleCase(d.motherName || ""), motherPhone: d.motherPhone, fatherName: titleCase(d.fatherName || ""), fatherPhone: d.fatherPhone, guardianCpf: d.guardianCpf, guardianIdentity: d.guardianIdentity },
      guardian_name: titleCase(d.guardianName),
      guardian_relationship: d.guardianRelationship,
      guardian_phone: d.guardianPhone,
      guardian_email: d.guardianEmail.toLowerCase(),
      health: { weight: d.weight, height: d.height, bloodType: d.bloodType, susCns: d.susCns, hasHealthCondition: d.hasHealthCondition, healthConditionDetails: d.healthConditionDetails, continuousMedication: d.continuousMedication, vaccinationUpToDate: d.vaccinationUpToDate, specialNeeds: d.specialNeeds, otherAllergies: d.otherAllergies },
      allergies: d.allergies,
      responsibility_accepted: d.termsAccepted,
      image_consent: d.imageConsent,
      signer_name: titleCase(d.signerName),
      terms_version: "RS9-2026-01",
      accepted_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("registrations").insert(registration);

    if (error) {
      if (error.code === "23505" && error.message.includes("registrations_pending_duplicate_idx")) {
        return NextResponse.json(
          { message: "Já existe uma inscrição pendente para este atleta. Não é necessário enviar novamente." },
          { status: 409 },
        );
      }

      if (error.code === "23505" && error.message.includes("registrations_enrollment_number_key")) {
        console.error("registration_enrollment_sequence_out_of_sync", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        return NextResponse.json(
          { message: "Não foi possível gerar a matrícula. A escola foi avisada; tente novamente após a correção." },
          { status: 503 },
        );
      }

      if (error.code === "23514" && error.message.includes("birth_date")) {
        return NextResponse.json(
          { message: "A data de nascimento não pode estar no futuro." },
          { status: 400 },
        );
      }

      console.error("registration_insert_failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ message: "Não foi possível concluir o envio. Tente novamente em instantes." }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Solicitação inválida." }, { status: 400 });
  }
}
