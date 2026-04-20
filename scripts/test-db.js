const { createClient } = require('@supabase/supabase-js');

const url = "https://nmvupgurzfdwzsocsvyq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw";

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('checklist_items').select('*').limit(5);
  console.log("Error:", error);
  console.log("Data count:", data?.length);
  console.log("Data sample:", data);
}

run();
