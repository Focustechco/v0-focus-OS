import { NextRequest, NextResponse } from 'next/server';
import { interFetch } from '@/lib/inter-api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get('dataInicio') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dataFim = searchParams.get('dataFim') || new Date().toISOString().split('T')[0];
    const pagina = searchParams.get('pagina') || '0';
    const tamanhoPagina = searchParams.get('tamanhoPagina') || '50';
    const resumo = searchParams.get('resumo');

    // Se o frontend solicitar o resumo para os gráficos (DRE / Últimos 6 meses)
    if (resumo === 'true') {
      // Retorna dados agrupados simulados baseados no perfil do Inter para popular o gráfico do Focus OS
      const meses = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
      const dadosGrafico = meses.map((mes, idx) => ({
        name: mes,
        entradas: 15000 + Math.random() * 8000 + (idx * 1500),
        saidas: 10000 + Math.random() * 5000 + (idx * 1000),
      }));
      return NextResponse.json({
        totalEntradasMes: dadosGrafico[5].entradas,
        totalSaidasMes: dadosGrafico[5].saidas,
        resultadoLiquido: dadosGrafico[5].entradas - dadosGrafico[5].saidas,
        graficoFluxo: dadosGrafico
      });
    }

    const path = `/banking/v3/extrato?dataInicio=${dataInicio}&dataFim=${dataFim}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`;
    const data = await interFetch('GET', path);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar extrato Banco Inter:', error);
    
    // Fallback amigável de dados em caso de credenciais não configuradas para o dev ver a UI funcionando
    const fallbackData = {
      transacoes: [
        { dataLancamento: new Date().toISOString().split('T')[0], tipoLancamento: 'CREDITO', valor: 4500.00, titulo: 'Recebimento Pix LTDA', descricao: 'PIX RECEBIDO', canal: 'PIX', documento: '12.345.678/0001-99' },
        { dataLancamento: new Date(Date.now() - 86400000).toISOString().split('T')[0], tipoLancamento: 'DEBITO', valor: 350.00, titulo: 'Pagamento Light S.A.', descricao: 'BOLETO PAGO', canal: 'BOLETO', documento: '00.123.456/0001-00' },
        { dataLancamento: new Date(Date.now() - 172800000).toISOString().split('T')[0], tipoLancamento: 'DEBITO', valor: 1200.00, titulo: 'Transferência para Diretor', descricao: 'TED ENVIADA', canal: 'TED', documento: '111.222.333-44' },
        { dataLancamento: new Date(Date.now() - 259200000).toISOString().split('T')[0], tipoLancamento: 'CREDITO', valor: 1500.00, titulo: 'Geração Pix Avulso', descricao: 'PIX RECEBIDO', canal: 'PIX', documento: '55.666.777/0001-88' },
      ]
    };

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(fallbackData);
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao consultar extrato no Banco Inter' },
      { status: 500 }
    );
  }
}
