const { createClient } = require('@supabase/supabase-js');

const url = "https://nmvupgurzfdwzsocsvyq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw";

const supabase = createClient(url, key);

async function run() {
  const { data: { users } } = await supabase.auth.admin.listUsers();

  const notifications = [
    { titulo: '🚀 Nova tarefa atribuída', mensagem: 'Você foi designado para a tarefa "Implementar Dashboard v2".', tipo: 'nova_task' },
    { titulo: '✅ Tarefa concluída', mensagem: 'A tarefa "Configurar CI/CD" foi marcada como concluída.', tipo: 'task_concluida' },
    { titulo: '📊 Relatório disponível', mensagem: 'O relatório mensal de Abril está pronto para revisão.', tipo: 'sistema' },
  ];

  for (const user of users) {
    for (const notif of notifications) {
      const { error } = await supabase.from('notificacoes').insert({
        user_id: user.id,
        titulo: notif.titulo,
        mensagem: notif.mensagem,
        tipo: notif.tipo,
        lida: false,
      });
      if (error) {
        console.log(`Error for ${user.email}:`, error.message);
      }
    }
    console.log(`✓ 3 notificações inseridas para ${user.email} (${user.id})`);
  }

  console.log('\nDone! Total:', users.length * notifications.length, 'notificações inseridas.');
}

run();
