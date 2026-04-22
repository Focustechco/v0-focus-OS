import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDriveClient } from "@/lib/google-drive"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("drive_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not connected" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "No fileId provided" }, { status: 400 })
    }

    const drive = getDriveClient(accessToken)
    
    const file = await drive.files.get({
      fileId: fileId,
      fields: "webContentLink, webViewLink"
    })

    return NextResponse.json({ 
      downloadUrl: file.data.webContentLink,
      viewUrl: file.data.webViewLink
    })
  } catch (error: any) {
    console.error("[Drive Download]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
