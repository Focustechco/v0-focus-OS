import { NextResponse } from 'next/server';
import { interFetch } from '@/lib/inter-api';

export async function GET() {
  try {
    const data = await interFetch('GET', '/banking/v3/saldo');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar saldo Banco Inter:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao consultar saldo no Banco Inter' },
      { status: 500 }
    );
  }
}
