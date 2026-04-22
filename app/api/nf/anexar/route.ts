import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { cobrancaId, arquivo, numero } = await request.json();

    if (!cobrancaId || !arquivo || !numero) {
      return NextResponse.json({ error: "cobrancaId, arquivo e numero são obrigatórios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("notas_fiscais")
      .insert({
        cobrancaId,
        arquivo, // URL ou base64
        numero,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro no Supabase ao anexar NF:", error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao anexar nota fiscal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
