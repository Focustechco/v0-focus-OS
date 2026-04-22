
const { getTeams } = require('./lib/clickup-api');
require('dotenv').config({ path: '.env.local' });

async function findCrmWorkspace() {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.error('CLICKUP_API_TOKEN not found in .env.local');
    return;
  }

  try {
    const { teams } = await getTeams(token);
    console.log('Workspaces encontrados:');
    teams.forEach(t => {
      console.log(`- Nome: ${t.name}, ID: ${t.id}`);
    });

    const crmWorkspace = teams.find(t => t.name.toLowerCase() === 'crm');
    if (crmWorkspace) {
      console.log(`\nWORKSPACE 'crm' ENCONTRADO! ID: ${crmWorkspace.id}`);
    } else {
      console.log('\nNenhum workspace chamado "crm" encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar workspaces:', error.message);
  }
}

findCrmWorkspace();
