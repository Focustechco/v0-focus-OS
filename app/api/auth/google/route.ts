import { NextRequest, NextResponse } from "next/server"

// Google OAuth callback handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // Contains the scope type (sheets, drive, calendar)
  const error = searchParams.get("error")

  if (error) {
    return new NextResponse(
      generateCallbackHTML("GOOGLE_AUTH_ERROR", { error }),
      { headers: { "Content-Type": "text/html" } }
    )
  }

  if (!code) {
    return new NextResponse(
      generateCallbackHTML("GOOGLE_AUTH_ERROR", { error: "No authorization code received" }),
      { headers: { "Content-Type": "text/html" } }
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google`

    if (!clientId || !clientSecret) {
      // Demo mode - return mock token
      return new NextResponse(
        generateCallbackHTML("GOOGLE_AUTH_SUCCESS", {
          accessToken: `demo_token_${state}_${Date.now()}`,
          expiresIn: 3600,
        }),
        { headers: { "Content-Type": "text/html" } }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      return new NextResponse(
        generateCallbackHTML("GOOGLE_AUTH_ERROR", { error: errorData.error_description || "Token exchange failed" }),
        { headers: { "Content-Type": "text/html" } }
      )
    }

    const tokenData = await tokenResponse.json()

    return new NextResponse(
      generateCallbackHTML("GOOGLE_AUTH_SUCCESS", {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      }),
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (err) {
    console.error("Google OAuth error:", err)
    return new NextResponse(
      generateCallbackHTML("GOOGLE_AUTH_ERROR", { error: "Internal server error" }),
      { headers: { "Content-Type": "text/html" } }
    )
  }
}

function generateCallbackHTML(type: string, data: Record<string, unknown>): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Autenticacao Google</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0A0A0A;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top-color: #FF6B00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <p>Processando autenticacao...</p>
        </div>
        <script>
          window.opener.postMessage({
            type: "${type}",
            ...${JSON.stringify(data)}
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        </script>
      </body>
    </html>
  `
}
