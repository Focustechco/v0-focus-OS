const { createClient } = require('@supabase/supabase-js');

const url = "https://nmvupgurzfdwzsocsvyq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw";

const supabase = createClient(url, key);

async function run() {
  console.log("Criando bucket project-documents...");
  const b1 = await supabase.storage.createBucket('project-documents', { public: true, fileSizeLimit: 20971520, allowedMimeTypes: ['application/pdf'] });
  console.log("Bucket project-documents:", b1.error || "OK");
}

run();
