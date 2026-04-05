import { NextRequest, NextResponse } from "next/server"

// Google Calendar API proxy
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
      case "events":
        return await getEvents(accessToken, searchParams)
      case "calendars":
        return await listCalendars(accessToken)
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error("Calendar API error:", err)
    return NextResponse.json(
      { error: "API request failed" },
      { status: 500 }
    )
  }
}

async function getEvents(accessToken: string, params: URLSearchParams) {
  const calendarId = params.get("calendarId") || "primary"
  const maxResults = params.get("maxResults") || "10"
  const timeMin = params.get("timeMin") || new Date().toISOString()

  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    const now = new Date()
    return NextResponse.json({
      items: [
        {
          id: "evt1",
          summary: "Sprint Planning",
          start: { dateTime: new Date(now.getTime() + 3600000).toISOString() },
          end: { dateTime: new Date(now.getTime() + 7200000).toISOString() },
          description: "Reuniao de planejamento do sprint",
        },
        {
          id: "evt2",
          summary: "Daily Standup",
          start: { dateTime: new Date(now.getTime() + 86400000).toISOString() },
          end: { dateTime: new Date(now.getTime() + 86400000 + 1800000).toISOString() },
        },
        {
          id: "evt3",
          summary: "Review Cliente X",
          start: { dateTime: new Date(now.getTime() + 172800000).toISOString() },
          end: { dateTime: new Date(now.getTime() + 172800000 + 3600000).toISOString() },
          description: "Apresentacao do projeto para o cliente",
        },
        {
          id: "evt4",
          summary: "Retrospectiva",
          start: { dateTime: new Date(now.getTime() + 259200000).toISOString() },
          end: { dateTime: new Date(now.getTime() + 259200000 + 3600000).toISOString() },
        },
      ],
    })
  }

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
  url.searchParams.set("maxResults", maxResults)
  url.searchParams.set("timeMin", timeMin)
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

async function listCalendars(accessToken: string) {
  // Demo mode
  if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
    return NextResponse.json({
      items: [
        { id: "primary", summary: "Calendario Principal", primary: true },
        { id: "work", summary: "Trabalho", primary: false },
        { id: "focus", summary: "Focus Projects", primary: false },
      ],
    })
  }

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const errorData = await response.json()
    return NextResponse.json(errorData, { status: response.status })
  }

  return NextResponse.json(await response.json())
}

// Create event
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
    const body = await request.json()
    const { calendarId = "primary", event } = body

    if (!event) {
      return NextResponse.json({ error: "Event data required" }, { status: 400 })
    }

    // Demo mode
    if (accessToken.startsWith("demo_") || accessToken.startsWith("mock_")) {
      return NextResponse.json({
        id: `evt_${Date.now()}`,
        ...event,
        status: "confirmed",
      })
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch (err) {
    console.error("Calendar create event error:", err)
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
