// ClickUp Server-side Helper
// Usa o token do env (CLICKUP_API_TOKEN) — NUNCA expõe ao browser.
// Toda chamada ClickUp do app deve passar por API routes em /api/clickup/*.

import "server-only"

const BASE_URL = "https://api.clickup.com/api/v2"

export class ClickUpNotConfiguredError extends Error {
  constructor() {
    super("ClickUp não configurado: defina CLICKUP_API_TOKEN em .env.local")
    this.name = "ClickUpNotConfiguredError"
  }
}

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN
  if (!token) throw new ClickUpNotConfiguredError()
  return token
}

export function getClickUpConfig() {
  return {
    token: process.env.CLICKUP_API_TOKEN || null,
    teamId: process.env.CLICKUP_TEAM_ID || null,
    spaceId: process.env.CLICKUP_SPACE_ID || null,
    listId: process.env.CLICKUP_LIST_ID || null,
    configured: Boolean(process.env.CLICKUP_API_TOKEN),
  }
}

export async function clickupFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken()
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as { err?: string }).err || `ClickUp API Error: ${response.status}`
    )
  }

  return response.json() as Promise<T>
}

export async function getTask(taskId: string): Promise<any> {
  return clickupFetch(`/task/${taskId}`)
}

export async function getTasks(listId: string): Promise<{ tasks: any[] }> {
  return clickupFetch(`/list/${listId}/task?include_closed=true`)
}
