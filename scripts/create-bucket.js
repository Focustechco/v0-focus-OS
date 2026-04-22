import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const envFile = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
const envMap = envFile.split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=")
  if (key && val.length) acc[key.trim()] = val.join("=").trim()
  return acc
}, {})

const supabaseUrl = envMap["NEXT_PUBLIC_SUPABASE_URL"]
const supabaseServiceKey = envMap["SUPABASE_SERVICE_ROLE_KEY"]

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("Checking buckets...")
  const { data: buckets, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error("Error listing buckets:", error)
    return
  }

  const exists = buckets.some(b => b.name === "documentos")
  if (exists) {
    console.log("Bucket 'documentos' already exists.")
  } else {
    console.log("Creating bucket 'documentos'...")
    const { data, error: createError } = await supabase.storage.createBucket("documentos", {
      public: false
    })
    if (createError) {
      console.error("Error creating bucket:", createError)
    } else {
      console.log("Bucket created successfully:", data)
    }
  }
}

run()
