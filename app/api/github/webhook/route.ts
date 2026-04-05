import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// GitHub webhook handler
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256")
    const event = request.headers.get("x-github-event")
    const body = await request.text()

    // Verify webhook signature if secret is configured
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex")}`

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    const payload = JSON.parse(body)

    // Handle different webhook events
    switch (event) {
      case "push":
        await handlePushEvent(payload)
        break
      case "pull_request":
        await handlePullRequestEvent(payload)
        break
      case "issues":
        await handleIssuesEvent(payload)
        break
      case "ping":
        // Webhook verification
        return NextResponse.json({ message: "pong" })
      default:
        console.log(`Unhandled GitHub event: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("GitHub webhook error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handlePushEvent(payload: {
  repository: { name: string }
  commits: Array<{ message: string; author: { name: string } }>
  pusher: { name: string }
}) {
  const { repository, commits, pusher } = payload
  console.log(`[GitHub Webhook] Push to ${repository.name} by ${pusher.name}`)
  console.log(`[GitHub Webhook] ${commits.length} commits`)
  
  // TODO: Update Focus OS state with latest commit info
  // This would typically emit an event or update a database
}

async function handlePullRequestEvent(payload: {
  action: string
  pull_request: { title: string; number: number; state: string }
  repository: { name: string }
}) {
  const { action, pull_request, repository } = payload
  console.log(`[GitHub Webhook] PR #${pull_request.number} ${action} in ${repository.name}`)
  
  // TODO: Update Focus OS state with PR info
}

async function handleIssuesEvent(payload: {
  action: string
  issue: { title: string; number: number; state: string }
  repository: { name: string }
}) {
  const { action, issue, repository } = payload
  console.log(`[GitHub Webhook] Issue #${issue.number} ${action} in ${repository.name}`)
  
  // TODO: Sync with Focus OS tasks if configured
}
