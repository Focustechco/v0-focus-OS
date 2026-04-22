import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useAsaas() {
  const { data: cobrancas, error: errCobrancas, mutate: mutateCobrancas } = useSWR('/api/asaas/cobrancas', fetcher);
  const { data: pagamentos, error: errPagamentos } = useSWR('/api/asaas/pagamentos', fetcher);

  const criarCobranca = async (dados: any) => {
    const res = await axios.post('/api/asaas/cobrancas', dados);
    mutateCobrancas();
    return res.data;
  };

  const buscarBoletoPdf = async (id: string) => {
    const res = await axios.get(`/api/asaas/boleto/${id}/pdf`);
    return res.data.url;
  };

  const buscarLinhaDigitavel = async (id: string) => {
    const res = await axios.get(`/api/asaas/boleto/${id}/linha`);
    return res.data.identificationField;
  };

  const enviarBoletoEmail = async (id: string, email: string, mensagem: string) => {
    const res = await axios.post('/api/asaas/boleto/enviar', {
      cobrancaId: id,
      email,
      mensagem
    });
    return res.data;
  };

  const anexarNF = async (cobrancaId: string, arquivo: string, numero: string) => {
    const res = await axios.post('/api/nf/anexar', {
      cobrancaId,
      arquivo,
      numero
    });
    return res.data;
  };

  return {
    cobrancas: cobrancas?.data || [],
    pagamentos: pagamentos?.data || [],
    isLoading: !cobrancas && !errCobrancas,
    isError: errCobrancas || errPagamentos,
    criarCobranca,
    buscarBoletoPdf,
    buscarLinhaDigitavel,
    enviarBoletoEmail,
    anexarNF,
    mutateCobrancas
  };
}
