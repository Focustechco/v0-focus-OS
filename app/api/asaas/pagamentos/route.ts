import { NextResponse } from "next/server";
import createAsaasClient from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const asaasApi = createAsaasClient();
    const response = await asaasApi.get("/payments", {
      params: {
        status: "RECEIVED",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos recebidos", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
