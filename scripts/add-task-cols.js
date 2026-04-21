const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { error } = await supa.rpc('exec_sql', {
    sql: `
      ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tempo_estimado integer;
      ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS meta_id uuid;
    `
  })
  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      // do it via direct query if possible, or fallback: no backend alteration, we just won't throw if it fails
      console.log('Cant run RPC')
    } else {
       console.log('Error:', error)
    }
  } else {
    console.log('Columns added successfully via RPC')
  }
}

run()
