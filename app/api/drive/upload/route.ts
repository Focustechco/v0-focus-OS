import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDriveClient } from "@/lib/google-drive"
import { Readable } from "stream"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("drive_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not connected" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string || "root"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const drive = getDriveClient(accessToken)
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId]
      },
      media: {
        mimeType: file.type,
        body: stream
      },
      fields: "id, name, webViewLink"
    })

    return NextResponse.json({ file: response.data }, { status: 201 })
  } catch (error: any) {
    console.error("[Drive Upload]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
