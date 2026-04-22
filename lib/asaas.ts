import axios, { AxiosInstance } from 'axios';

// Cria uma instância fresca a cada chamada, garantindo que
// as variáveis de ambiente sejam lidas no momento da requisição
function createAsaasClient(): AxiosInstance {
  const apiKey = process.env.ASAAS_API_KEY || process.env.ASAAS_TOKEN;
  const baseURL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';

  if (!apiKey) {
    console.warn('[Asaas] ASAAS_API_KEY não está definida nas variáveis de ambiente.');
  }

  return axios.create({
    baseURL,
    headers: {
      'access_token': apiKey || '',
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

export default createAsaasClient;
