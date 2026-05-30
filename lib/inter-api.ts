import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

let cachedToken: string | null = null;
let tokenExpiry = 0;

function getCertificates() {
  let cert: string | Buffer | undefined;
  let key: string | Buffer | undefined;

  if (process.env.INTER_CERT_BASE64) {
    cert = Buffer.from(process.env.INTER_CERT_BASE64, 'base64');
  } else if (process.env.INTER_CERT_PATH) {
    const certPath = path.isAbsolute(process.env.INTER_CERT_PATH)
      ? process.env.INTER_CERT_PATH
      : path.join(process.cwd(), process.env.INTER_CERT_PATH);
    if (fs.existsSync(certPath)) {
      cert = fs.readFileSync(certPath);
    }
  }

  if (process.env.INTER_KEY_BASE64) {
    key = Buffer.from(process.env.INTER_KEY_BASE64, 'base64');
  } else if (process.env.INTER_KEY_PATH) {
    const keyPath = path.isAbsolute(process.env.INTER_KEY_PATH)
      ? process.env.INTER_KEY_PATH
      : path.join(process.cwd(), process.env.INTER_KEY_PATH);
    if (fs.existsSync(keyPath)) {
      key = fs.readFileSync(keyPath);
    }
  }

  return { cert, key };
}

export function makeHttpsAgent() {
  const { cert, key } = getCertificates();
  if (!cert || !key) {
    throw new Error('Certificados do Banco Inter não configurados (.env ou base64)');
  }
  return new https.Agent({
    cert,
    key,
    keepAlive: true,
  });
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  headers?: Record<string, string>;
}

export function interRequest<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const agent = makeHttpsAgent();
      const payload = options.body ? JSON.stringify(options.body) : '';
      
      const reqHeaders: Record<string, string> = {
        'x-conta-corrente': process.env.INTER_CONTA_CORRENTE || '',
        ...options.headers,
      };

      if (options.body) {
        reqHeaders['Content-Type'] = 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
      }

      const reqOptions: https.RequestOptions = {
        hostname: 'cdpj.partners.bancointer.com.br',
        port: 443,
        path: options.path,
        method: options.method,
        agent,
        headers: reqHeaders,
      };

      const req = https.request(reqOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Erro Banco Inter (${res.statusCode}): ${responseData}`));
              return;
            }
            if (!responseData) {
              resolve({} as T);
              return;
            }
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error(`Erro ao parsear resposta do Banco Inter: ${e instanceof Error ? e.message : String(e)}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(payload);
      }
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 60000) {
    return cachedToken;
  }

  const clientId = process.env.INTER_CLIENT_ID;
  const clientSecret = process.env.INTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('INTER_CLIENT_ID e INTER_CLIENT_SECRET são obrigatórios.');
  }

  const scope = [
    'extrato.read',
    'boleto-cobranca.read',
    'boleto-cobranca.write',
    'pagamento-pix.write',
    'pagamento-pix.read',
    'cob.read',
    'cob.write',
    'pix.read',
    'pix.write',
    'pagamento-boleto.read',
    'pagamento-boleto.write',
    'pagamento-debito.write',
    'pagamento-debito.read'
  ].join(' ');

  const bodyData = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope,
    grant_type: 'client_credentials',
  }).toString();

  return new Promise((resolve, reject) => {
    try {
      const agent = makeHttpsAgent();
      const reqOptions: https.RequestOptions = {
        hostname: 'cdpj.partners.bancointer.com.br',
        port: 443,
        path: '/oauth/v2/token',
        method: 'POST',
        agent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyData).toString(),
        },
      };

      const req = https.request(reqOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Erro ao obter token (${res.statusCode}): ${responseData}`));
              return;
            }
            const data = JSON.parse(responseData);
            cachedToken = data.access_token;
            // expires_in em segundos, converter para ms e descontar margem de 5 minutos
            tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000;
            resolve(data.access_token);
          } catch (e) {
            reject(new Error(`Erro ao parsear resposta do token: ${e instanceof Error ? e.message : String(e)}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(bodyData);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function interFetch<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: any
): Promise<T> {
  const token = await getAccessToken();
  return interRequest<T>({
    method,
    path,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
