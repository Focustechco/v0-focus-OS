import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { cobrancaId, email, mensagem } = await request.json();

    if (!cobrancaId || !email) {
      return NextResponse.json({ error: "cobrancaId e email são obrigatórios" }, { status: 400 });
    }

    // Endpoint do Asaas para enviar cobrança por email
    const response = await asaasApi.post(`/payments/${cobrancaId}/sendLinkByEmail`, {
      email,
      // O Asaas não aceita mensagem customizada diretamente nesse endpoint v3 básico, 
      // mas vamos manter o parâmetro caso o usuário use algum sistema de notificação customizado.
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao enviar boleto por email:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao enviar boleto", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
