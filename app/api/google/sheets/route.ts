import { NextRequest, NextResponse } from "next/server"

// Google Sheets API proxy
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
  const spreadsheetId = searchParams.get("spreadsheetId")

  try {
    switch (action) {
      case "get":
        if (!spreadsheetId) {
          return NextResponse.json({ error: "Spreadsheet ID required" }, { status: 400 })
        }
        return await getSpreadsheet(accessToken, spreadsheetId)
      case "values":
        if (!spreadsheetId) {
          return NextResponse.json({ error: "Spreadsheet ID required" }, { status: 400 })
        }
        const range = searchParams.get("range") || "A1:Z1000"
        return await getValues(accessToken, spreadsheetId, range)
      case "list":
        return await listSpreadsheets(accessToken)
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error("Sheets API error:", err)
    return NextResponse.json(
      { error: "API request failed" },
      { status: 500 }
    )
  }
}

async function getSpreadsheet(accessToken: string, spreadsheetId: string) {
  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      spreadsheetId,
      properties: {
        title: "Planilha de Exemplo",
      },
      sheets: [
        { properties: { sheetId: 0, title: "Sheet1", gridProperties: { rowCount: 100, columnCount: 26 } } },
        { properties: { sheetId: 1, title: "Sheet2", gridProperties: { rowCount: 50, columnCount: 10 } } },
      ],
    })
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function getValues(accessToken: string, spreadsheetId: string, range: string) {
  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      range: `Sheet1!${range}`,
      majorDimension: "ROWS",
      values: [
        ["Nome", "Email", "Status", "Data"],
        ["Cliente A", "cliente.a@email.com", "Ativo", "2024-01-15"],
        ["Cliente B", "cliente.b@email.com", "Pendente", "2024-01-20"],
        ["Cliente C", "cliente.c@email.com", "Ativo", "2024-02-01"],
        ["Cliente D", "cliente.d@email.com", "Inativo", "2024-02-10"],
      ],
    })
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function listSpreadsheets(accessToken: string) {
  // Demo mode - list sheets from Drive
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      files: [
        { id: "sheet1", name: "Controle de Horas - Marco", modifiedTime: new Date().toISOString() },
        { id: "sheet2", name: "Budget 2024", modifiedTime: new Date(Date.now() - 86400000).toISOString() },
        { id: "sheet3", name: "Relatorio Vendas Q1", modifiedTime: new Date(Date.now() - 172800000).toISOString() },
      ],
    })
  }

  // Use Drive API to list spreadsheets
  const url = new URL("https://www.googleapis.com/drive/v3/files")
  url.searchParams.set("q", "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false")
  url.searchParams.set("fields", "files(id,name,modifiedTime,webViewLink)")
  url.searchParams.set("pageSize", "50")
  url.searchParams.set("orderBy", "modifiedTime desc")

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}
