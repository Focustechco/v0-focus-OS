import { NextResponse } from "next/server";
import createAsaasClient from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const asaasApi = createAsaasClient();
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
