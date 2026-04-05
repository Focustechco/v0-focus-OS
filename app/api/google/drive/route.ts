import { NextRequest, NextResponse } from "next/server"

// Google Drive API proxy
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const accessToken = authHeader?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "list":
        return await listFiles(accessToken, searchParams)
      case "get":
        return await getFile(accessToken, searchParams.get("fileId") || "")
      case "search":
        return await searchFiles(accessToken, searchParams.get("query") || "")
      case "quota":
        return await getQuota(accessToken)
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error("Drive API error:", err)
    return NextResponse.json(
      { error: "API request failed" },
      { status: 500 }
    )
  }
}

async function listFiles(accessToken: string, params: URLSearchParams) {
  const pageSize = params.get("pageSize") || "20"
  const pageToken = params.get("pageToken") || ""
  const mimeType = params.get("mimeType") || ""
  const folderId = params.get("folderId") || ""

  let query = "trashed=false"
  if (mimeType) {
    query += ` and mimeType='${mimeType}'`
  }
  if (folderId) {
    query += ` and '${folderId}' in parents`
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files")
  url.searchParams.set("pageSize", pageSize)
  url.searchParams.set("q", query)
  url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,webViewLink,thumbnailLink,modifiedTime,size)")
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken)
  }

  // Demo mode check
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      files: [
        { id: "d1", name: "Proposta Comercial - Cliente A.pdf", mimeType: "application/pdf", webViewLink: "#", modifiedTime: new Date().toISOString(), size: "2400000" },
        { id: "d2", name: "Contrato de Servicos.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", webViewLink: "#", modifiedTime: new Date().toISOString(), size: "450000" },
        { id: "d3", name: "Planilha Financeira Q1.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", webViewLink: "#", modifiedTime: new Date().toISOString(), size: "890000" },
      ],
    })
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function getFile(accessToken: string, fileId: string) {
  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 })
  }

  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      id: fileId,
      name: "Demo File.pdf",
      mimeType: "application/pdf",
      webViewLink: "#",
      modifiedTime: new Date().toISOString(),
    })
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,thumbnailLink,modifiedTime,size`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function searchFiles(accessToken: string, query: string) {
  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      files: [
        { id: "s1", name: `Resultado: ${query}.pdf`, mimeType: "application/pdf", webViewLink: "#", modifiedTime: new Date().toISOString() },
      ],
    })
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files")
  url.searchParams.set("q", `name contains '${query}' and trashed=false`)
  url.searchParams.set("fields", "files(id,name,mimeType,webViewLink,thumbnailLink,modifiedTime,size)")
  url.searchParams.set("pageSize", "20")

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function getQuota(accessToken: string) {
  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      storageQuota: {
        limit: "16106127360", // 15GB
        usage: "5368709120", // ~5GB
      },
    })
  }

  const response = await fetch(
    "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

// Upload file to Drive
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const accessToken = authHeader?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const folderId = formData.get("folderId") as string | null

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 })
    }

    // Demo mode
    if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
      return NextResponse.json({
        id: `uploaded_${Date.now()}`,
        name: name || file.name,
        mimeType: file.type,
        webViewLink: "#",
        modifiedTime: new Date().toISOString(),
      })
    }

    // Create file metadata
    const metadata: Record<string, unknown> = {
      name: name || file.name,
    }
    if (folderId) {
      metadata.parents = [folderId]
    }

    // Multipart upload
    const boundary = "focus_os_upload_boundary"
    const fileBuffer = await file.arrayBuffer()

    const body = [
      `--${boundary}\r\n`,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\n`,
      `Content-Type: ${file.type}\r\n\r\n`,
      new Uint8Array(fileBuffer),
      `\r\n--${boundary}--`,
    ]

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: new Blob(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch (err) {
    console.error("Drive upload error:", err)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
