import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { registrationSchema } from "@/lib/validation/registration";

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = registrationSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ message: "Revise os campos informados." }, { status: 400 });
    if (parsed.data.honeypot) return NextResponse.json({ message: "Não foi possível processar." }, { status: 400 });
    if (!isSupabaseConfigured()) return NextResponse.json({ message: "O serviço ainda não foi configurado pela escola." }, { status: 503 });

    const d = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.from("registrations").insert({
      athlete_name: d.athleteName,
      athlete_nickname: d.athleteNickname || null,
      birth_date: d.birthDate,
      athlete_document: d.athleteDocument || null,
      naturality: d.naturality || null,
      school_name: d.schoolName || null,
      school_grade: d.schoolGrade || null,
      school_shift: d.schoolShift,
      address: { zipCode: d.zipCode, street: d.street, number: d.number, complement: d.complement, neighborhood: d.neighborhood, city: d.city, state: d.state.toUpperCase() },
      family: { motherName: d.motherName, motherPhone: d.motherPhone, fatherName: d.fatherName, fatherPhone: d.fatherPhone },
      guardian_name: d.guardianName,
      guardian_relationship: d.guardianRelationship,
      guardian_phone: d.guardianPhone,
      guardian_email: d.guardianEmail.toLowerCase(),
      health: { weight: d.weight, height: d.height, bloodType: d.bloodType, susCns: d.susCns, hasHealthCondition: d.hasHealthCondition, healthConditionDetails: d.healthConditionDetails, continuousMedication: d.continuousMedication, vaccinationUpToDate: d.vaccinationUpToDate, specialNeeds: d.specialNeeds, otherAllergies: d.otherAllergies },
      allergies: d.allergies,
      responsibility_accepted: d.termsAccepted,
      image_consent: d.imageConsent,
      signer_name: d.signerName,
      terms_version: "PENDENTE_REVISAO_2026-01",
      accepted_at: new Date().toISOString(),
    });
    if (error) {
      console.error("registration_insert_failed", error.code);
      return NextResponse.json({ message: "Não foi possível concluir o envio. Tente novamente em instantes." }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Solicitação inválida." }, { status: 400 });
  }
}
