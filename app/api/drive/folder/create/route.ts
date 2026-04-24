import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDriveClient } from "@/lib/google-drive"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("drive_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not connected" }, { status: 401 })
    }

    const { parentId = "root", name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const drive = getDriveClient(accessToken)
    const response = await drive.files.create({
      requestBody: {
        name,
        parents: [parentId],
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id, name, webViewLink",
    })

    return NextResponse.json({ folder: response.data }, { status: 201 })
  } catch (error: any) {
    console.error("[Drive Folder Create]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
