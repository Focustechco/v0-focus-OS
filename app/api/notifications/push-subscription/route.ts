import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId, subscription } = await request.json()

    if (!userId || !subscription) {
      return NextResponse.json({ error: "userId and subscription are required" }, { status: 400 })
    }

    const { endpoint, keys } = subscription
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 })
    }

    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    })

    return NextResponse.json(pushSub)
  } catch (error: any) {
    console.error("Erro ao salvar push subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
