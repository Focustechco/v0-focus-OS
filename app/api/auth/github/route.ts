import { NextRequest, NextResponse } from "next/server"

// GitHub OAuth callback handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return new NextResponse(
      generateCallbackHTML("GITHUB_AUTH_ERROR", { error }),
      { headers: { "Content-Type": "text/html" } }
    )
  }

  if (!code) {
    return new NextResponse(
      generateCallbackHTML("GITHUB_AUTH_ERROR", { error: "No authorization code received" }),
      { headers: { "Content-Type": "text/html" } }
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      // Demo mode - return mock token
      return new NextResponse(
        generateCallbackHTML("GITHUB_AUTH_SUCCESS", {
          accessToken: `demo_github_token_${Date.now()}`,
        }),
        { headers: { "Content-Type": "text/html" } }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      return new NextResponse(
        generateCallbackHTML("GITHUB_AUTH_ERROR", { error: "Token exchange failed" }),
        { headers: { "Content-Type": "text/html" } }
      )
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return new NextResponse(
        generateCallbackHTML("GITHUB_AUTH_ERROR", { error: tokenData.error_description || tokenData.error }),
        { headers: { "Content-Type": "text/html" } }
      )
    }

    return new NextResponse(
      generateCallbackHTML("GITHUB_AUTH_SUCCESS", {
        accessToken: tokenData.access_token,
      }),
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (err) {
    console.error("GitHub OAuth error:", err)
    return new NextResponse(
      generateCallbackHTML("GITHUB_AUTH_ERROR", { error: "Internal server error" }),
      { headers: { "Content-Type": "text/html" } }
    )
  }
}

function generateCallbackHTML(type: string, data: Record<string, unknown>): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Autenticacao GitHub</title>
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
