import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: task } = await supabase.from('tarefas').select('id').limit(1).single();
  if (!task) {
    console.log("No task found");
    return;
  }
  console.log("Testing insert into checklist_items for task_id:", task.id);
  const { data, error } = await supabase.from('checklist_items').insert({
    task_id: task.id,
    title: 'Test checklist item',
    is_done: false
  });
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
