async function verifyConfig() {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;

  if (!token || !listId) {
    console.error('Configuração incompleta. CLICKUP_API_TOKEN ou CLICKUP_LIST_ID não encontrados no ambiente.');
    console.log('Ambiente atual:', { token: !!token, listId: !!listId });
    return;
  }

  console.log(`Verificando conexão para a lista: ${listId}...`);
  
  try {
    const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?include_closed=true`, {
      headers: { Authorization: token }
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Sucesso! Encontradas ${data.tasks.length} tarefas.`);
    data.tasks.forEach(t => console.log(`- [${t.status.status.toUpperCase()}] ${t.name}`));
  } catch (error) {
    console.error('Falha na verificação:', error.message);
  }
}

verifyConfig();
