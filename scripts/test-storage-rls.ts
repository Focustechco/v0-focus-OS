import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
console.log("Using key:", key ? "Found" : "Mising")

const supabase = createClient(url, key)

async function testStorage() {
  console.log("Uploading file...")
  const { data, error } = await supabase.storage.from('project-documents').upload('test/test.pdf', Buffer.from([1,2,3]), { upsert: true, contentType: 'application/pdf' })
  console.log("Upload Result:", error || "Success")
}

testStorage()
