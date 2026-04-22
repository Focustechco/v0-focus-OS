import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await asaasApi.get(`/payments/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar detalhe da cobrança Asaas:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao buscar detalhe", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
