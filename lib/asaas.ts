import axios from 'axios';

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json',
  },
});

export default asaasApi;
