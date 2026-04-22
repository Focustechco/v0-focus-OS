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

async function testInsert() {
  const { data, error } = await supabase.from('eventos').insert({
    titulo: 'Teste',
    data: '2026-04-22',
    hora_inicio: '10:00',
    hora_fim: '11:00',
    duracao_minutos: 60,
    tipo: 'reuniao',
    cor: '#FF6B00',
    criado_por: null,
    sincronizado_google: false
  }).select().single()
  
  console.log('INSERT:', { data, error })
}
testInsert()
