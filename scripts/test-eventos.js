import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envMap = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [k, ...v] = line.split('=')
    if (k && v.length) acc[k.trim()] = v.join('=').trim()
    return acc
  }, {})

const supabase = createClient(envMap['NEXT_PUBLIC_SUPABASE_URL'], envMap['SUPABASE_SERVICE_ROLE_KEY'])

async function test() {
  const { data, error } = await supabase.from('eventos').select('*').limit(1)
  console.log('GET Eventos:', { error })
  
  if (error && error.code === '42P01') {
    console.log('Table does not exist. Please create it.')
  }
}
test()
