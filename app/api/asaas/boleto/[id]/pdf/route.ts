import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Asaas retorna o link para o PDF ou o PDF em si dependendo do endpoint
    // Para obter o link de visualização da fatura (que contém o PDF):
    const response = await asaasApi.get(`/payments/${params.id}`);
    const bankSlipUrl = response.data.bankSlipUrl;
    
    if (!bankSlipUrl) {
      return NextResponse.json({ error: "URL do boleto não disponível" }, { status: 404 });
    }

    return NextResponse.json({ url: bankSlipUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar PDF do boleto", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
