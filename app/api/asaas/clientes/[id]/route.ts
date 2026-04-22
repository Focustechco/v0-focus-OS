import { NextResponse } from "next/server";
import createAsaasClient from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const asaasApi = createAsaasClient();
    const response = await asaasApi.post(`/customers/${params.id}`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`[Asaas] Erro ao atualizar cliente ${params.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
