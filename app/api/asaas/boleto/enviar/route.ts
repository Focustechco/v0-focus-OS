import { NextResponse } from "next/server";
import createAsaasClient from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { cobrancaId, email } = await request.json();

    if (!cobrancaId || !email) {
      return NextResponse.json({ error: "cobrancaId e email são obrigatórios" }, { status: 400 });
    }

    const asaasApi = createAsaasClient();
    const response = await asaasApi.post(`/payments/${cobrancaId}/sendLinkByEmail`, { email });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[Asaas] Erro ao enviar boleto por email:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao enviar boleto", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
