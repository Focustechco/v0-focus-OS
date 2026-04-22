const { createClient } = require('@supabase/supabase-js');

const url = "https://nmvupgurzfdwzsocsvyq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw";

const supabase = createClient(url, key);

async function run() {
  // Step 1: Get all auth users
  console.log("=== STEP 1: Auth Users ===");
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.log("Error listing users:", usersErr.message);
    return;
  }
  console.log("Auth users:", users.map(u => ({ id: u.id, email: u.email })));
  
  if (!users || users.length === 0) {
    console.log("No users found!");
    return;
  }
  
  const testUserId = users[0].id;
  console.log("\nUsing test user:", testUserId);

  // Step 2: Check all real columns of notificacoes
  console.log("\n=== STEP 2: Check ALL possible columns ===");
  const allCols = ['id', 'titulo', 'mensagem', 'tipo', 'lida', 'user_id', 'created_at',
                   'referencia_id', 'referencia_tipo', 'descricao', 'usuario_id', 'read',
                   'is_read', 'updated_at'];
  for (const col of allCols) {
    const { error } = await supabase.from('notificacoes').select(col).limit(1);
    if (!error) console.log(`  ✓ ${col} EXISTS`);
  }

  // Step 3: Insert a test notification
  console.log("\n=== STEP 3: Insert test notification ===");
  const { data: inserted, error: insErr } = await supabase
    .from('notificacoes')
    .insert({
      titulo: 'Teste de Notificação',
      mensagem: 'Esta é uma notificação de teste do sistema.',
      tipo: 'sistema',
      lida: false,
      user_id: testUserId
    })
    .select();

  if (insErr) {
    console.log("Insert error:", insErr.message);
    
    // If user_id fails, try without it
    console.log("Trying insert WITHOUT user_id...");
    const { data: ins2, error: insErr2 } = await supabase
      .from('notificacoes')
      .insert({
        titulo: 'Teste de Notificação',
        mensagem: 'Esta é uma notificação de teste.',
        tipo: 'sistema',
        lida: false,
      })
      .select();
    
    if (insErr2) {
      console.log("Insert2 error:", insErr2.message);
    } else {
      console.log("Insert2 success! Row:", JSON.stringify(ins2[0], null, 2));
      console.log("ALL COLUMNS:", Object.keys(ins2[0]));
    }
  } else {
    console.log("Insert success! Row:", JSON.stringify(inserted[0], null, 2));
    console.log("ALL COLUMNS:", Object.keys(inserted[0]));
  }

  // Step 4: Read back
  console.log("\n=== STEP 4: Read all notifications ===");
  const { data: allNotifs, error: readErr } = await supabase
    .from('notificacoes')
    .select('*')
    .limit(5);
  
  if (readErr) {
    console.log("Read error:", readErr.message);
  } else {
    console.log("Total notifications:", allNotifs.length);
    if (allNotifs.length > 0) {
      console.log("REAL columns:", Object.keys(allNotifs[0]));
      console.log("Sample:", JSON.stringify(allNotifs[0], null, 2));
    }
  }
}

run();
