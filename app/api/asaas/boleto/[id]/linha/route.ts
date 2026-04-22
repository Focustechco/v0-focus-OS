import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await asaasApi.get(`/payments/${params.id}/identificationField`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar linha digitável", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
