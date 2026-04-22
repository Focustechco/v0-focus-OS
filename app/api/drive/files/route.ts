import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDriveClient } from "@/lib/google-drive"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("drive_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get("folderId") || "root"

    const drive = getDriveClient(accessToken)
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)",
      orderBy: "folder, modifiedTime desc",
      pageSize: 100
    })

    return NextResponse.json({ files: response.data.files || [] })
  } catch (error: any) {
    console.error("[Drive Files]", error.message)
    if (error.code === 401) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
