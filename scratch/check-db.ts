import { createAdminClient } from '../lib/supabase/server';

async function run() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('name', 'clickup');
  
  if (error) {
    console.error('ERRO:', error);
  } else {
    console.log('CONTEUDO:', JSON.stringify(data, null, 2));
  }
}

run();
