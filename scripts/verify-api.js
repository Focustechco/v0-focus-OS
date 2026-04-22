const { createClient } = require('@supabase/supabase-js');

const url = "https://nmvupgurzfdwzsocsvyq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw";

const supabase = createClient(url, key);

async function run() {
  // Simular exatamente o que a API faz
  const testUserId = '2276922a-50d7-4226-877f-59224cdf0c9d'; // adrianoleal.focus@gmail.com
  
  const { data: notifications, error } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("user_id", testUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.log("ERROR:", error.message);
    return;
  }

  console.log("Total notifications found:", notifications.length);

  // Map exactly like the API does
  const mapped = notifications.map(n => ({
    id: n.id,
    title: n.titulo,
    body: n.mensagem,
    isRead: n.lida,
    type: n.tipo,
    relatedEntityType: n.ref_type || null,
    relatedEntityId: n.ref_id || null,
    createdAt: n.created_at
  }));

  console.log("\nMapped response (this is what the API should return):");
  console.log(JSON.stringify(mapped, null, 2));
}

run();
