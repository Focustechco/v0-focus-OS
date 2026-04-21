import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const fullRow = {
    nome: "teste_erro",
    url: "https://teste.com",
    categoria: "plataforma_interna",
    secao: "projetos",
    visivel_para: "todos",
    tem_credencial: false,
  }
  const { data, error } = await supabase.from("acessos").insert(fullRow)
  console.log("FullRow Error:", error)
}
run()
