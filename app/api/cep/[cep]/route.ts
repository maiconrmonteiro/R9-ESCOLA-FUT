import { NextResponse } from "next/server";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | "true";
};

export async function GET(_request: Request, context: { params: Promise<{ cep: string }> }) {
  const { cep: rawCep } = await context.params;
  const cep = rawCep.replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ message: "Informe um CEP com 8 números." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) throw new Error("ViaCEP indisponível");

    const data = await response.json() as ViaCepResponse;
    if (data.erro || !data.cep) {
      return NextResponse.json({ message: "CEP não encontrado. Confira os números ou preencha o endereço manualmente." }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    });
  } catch {
    return NextResponse.json({ message: "Não foi possível consultar o CEP agora. Preencha o endereço manualmente." }, { status: 502 });
  }
}
