import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDriveClient } from "@/lib/google-drive"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("drive_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not connected" }, { status: 401 })
    }

    const drive = getDriveClient(accessToken)
    
    const response = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: "files(id, name, parents)",
      orderBy: "name",
      pageSize: 200
    })

    return NextResponse.json({ folders: response.data.files || [] })
  } catch (error: any) {
    console.error("[Drive Folders]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
