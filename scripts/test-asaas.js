const axios = require('axios');

const apiKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjgzZDM1MGY4LTc5MjItNDUwZS1hODEyLWJkYmFhOGI2MWE1Nzo6JGFhY2hfMTQ5NWRiNDMtMDIwZi00ZjA2LTg0YTktYjI5ZmIwYjU3NTRj';
const baseUrl = 'https://sandbox.asaas.com/api/v3';

async function testConnection() {
  try {
    const response = await axios.get(`${baseUrl}/customers`, {
      headers: {
        'access_token': apiKey
      }
    });
    console.log('SUCCESS: Connection working!');
    console.log('Total customers:', response.data.totalCount);
    if (response.data.data.length > 0) {
      console.log('First customer:', response.data.data[0].name);
    } else {
      console.log('NOTICE: No customers found in sandbox.');
    }
  } catch (error) {
    console.error('ERROR: Failed to connect to Asaas.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testConnection();
