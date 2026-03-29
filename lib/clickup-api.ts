// ClickUp API Wrapper
// Camada de integração com a API do ClickUp para o Módulo Comercial

const BASE_URL = 'https://api.clickup.com/api/v2'

export interface ClickUpConfig {
  token: string
  teamId?: string
  spaceId?: string
  listId?: string
  syncInterval?: number // em minutos
}

export interface ClickUpTeam {
  id: string
  name: string
  color: string
  avatar: string | null
  members: ClickUpMember[]
}

export interface ClickUpMember {
  user: {
    id: number
    username: string
    email: string
    color: string
    profilePicture: string | null
    initials: string
  }
}

export interface ClickUpSpace {
  id: string
  name: string
  private: boolean
  statuses: ClickUpStatus[]
}

export interface ClickUpFolder {
  id: string
  name: string
  orderindex: number
  hidden: boolean
  space: { id: string }
  task_count: string
  lists: ClickUpList[]
}

export interface ClickUpList {
  id: string
  name: string
  orderindex: number
  status: { status: string; color: string } | null
  priority: { priority: string; color: string } | null
  assignee: ClickUpMember['user'] | null
  task_count: number | null
  folder: { id: string; name: string } | null
  space: { id: string; name: string }
}

export interface ClickUpStatus {
  id: string
  status: string
  color: string
  orderindex: number
  type: string
}

export interface ClickUpTask {
  id: string
  custom_id: string | null
  name: string
  text_content: string | null
  description: string | null
  status: {
    status: string
    color: string
    type: string
    orderindex: number
  }
  orderindex: string
  date_created: string
  date_updated: string
  date_closed: string | null
  date_done: string | null
  creator: {
    id: number
    username: string
    color: string
    email: string
    profilePicture: string | null
  }
  assignees: {
    id: number
    username: string
    color: string
    initials: string
    email: string
    profilePicture: string | null
  }[]
  watchers: { id: number; username: string }[]
  checklists: unknown[]
  tags: { name: string; tag_fg: string; tag_bg: string }[]
  parent: string | null
  priority: {
    id: string
    priority: string
    color: string
    orderindex: string
  } | null
  due_date: string | null
  start_date: string | null
  points: number | null
  time_estimate: number | null
  time_spent: number | null
  custom_fields: ClickUpCustomField[]
  dependencies: unknown[]
  linked_tasks: unknown[]
  team_id: string
  url: string
  list: { id: string; name: string }
  project: { id: string; name: string }
  folder: { id: string; name: string }
  space: { id: string }
}

export interface ClickUpCustomField {
  id: string
  name: string
  type: string
  type_config: Record<string, unknown>
  date_created: string
  hide_from_guests: boolean
  required: boolean
  value?: string | number | boolean | null | unknown[]
}

export interface ClickUpComment {
  id: string
  comment_text: string
  user: {
    id: number
    username: string
    email: string
    color: string
    profilePicture: string | null
  }
  date: string
}

// API Client
export async function clickupFetch<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.err || `ClickUp API Error: ${response.status}`)
  }

  return response.json()
}

// Teams (Workspaces)
export async function getTeams(token: string): Promise<{ teams: ClickUpTeam[] }> {
  return clickupFetch('/team', token)
}

// Spaces
export async function getSpaces(token: string, teamId: string): Promise<{ spaces: ClickUpSpace[] }> {
  return clickupFetch(`/team/${teamId}/space?archived=false`, token)
}

// Folders
export async function getFolders(token: string, spaceId: string): Promise<{ folders: ClickUpFolder[] }> {
  return clickupFetch(`/space/${spaceId}/folder?archived=false`, token)
}

// Lists
export async function getLists(token: string, folderId: string): Promise<{ lists: ClickUpList[] }> {
  return clickupFetch(`/folder/${folderId}/list?archived=false`, token)
}

export async function getFolderlessLists(token: string, spaceId: string): Promise<{ lists: ClickUpList[] }> {
  return clickupFetch(`/space/${spaceId}/list?archived=false`, token)
}

// List Details (includes statuses)
export async function getList(token: string, listId: string): Promise<ClickUpList & { statuses: ClickUpStatus[] }> {
  return clickupFetch(`/list/${listId}`, token)
}

// Tasks
export async function getTasks(
  token: string,
  listId: string,
  options?: { archived?: boolean; includeClosed?: boolean; subtasks?: boolean }
): Promise<{ tasks: ClickUpTask[] }> {
  const params = new URLSearchParams({
    archived: String(options?.archived ?? false),
    include_closed: String(options?.includeClosed ?? true),
    subtasks: String(options?.subtasks ?? true),
  })
  return clickupFetch(`/list/${listId}/task?${params}`, token)
}

export async function getTask(token: string, taskId: string): Promise<ClickUpTask> {
  return clickupFetch(`/task/${taskId}`, token)
}

// Update Task
export async function updateTask(
  token: string,
  taskId: string,
  data: Partial<{
    name: string
    description: string
    status: string
    priority: number
    due_date: number | null
    assignees: { add: number[]; rem: number[] }
  }>
): Promise<ClickUpTask> {
  return clickupFetch(`/task/${taskId}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Create Task
export async function createTask(
  token: string,
  listId: string,
  data: {
    name: string
    description?: string
    status?: string
    priority?: number
    due_date?: number | null
    assignees?: number[]
    tags?: string[]
    custom_fields?: { id: string; value: unknown }[]
  }
): Promise<ClickUpTask> {
  return clickupFetch(`/list/${listId}/task`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Comments
export async function getComments(token: string, taskId: string): Promise<{ comments: ClickUpComment[] }> {
  return clickupFetch(`/task/${taskId}/comment`, token)
}

export async function addComment(
  token: string,
  taskId: string,
  text: string,
  notifyAll?: boolean
): Promise<ClickUpComment> {
  return clickupFetch(`/task/${taskId}/comment`, token, {
    method: 'POST',
    body: JSON.stringify({
      comment_text: text,
      notify_all: notifyAll ?? false,
    }),
  })
}

// Members
export async function getMembers(token: string, teamId: string): Promise<{ members: ClickUpMember[] }> {
  return clickupFetch(`/team/${teamId}/member`, token)
}

// Custom Fields
export async function getCustomFields(token: string, listId: string): Promise<{ fields: ClickUpCustomField[] }> {
  return clickupFetch(`/list/${listId}/field`, token)
}

// Test Connection
export async function testConnection(token: string): Promise<{ user: { id: number; username: string; email: string } }> {
  return clickupFetch('/user', token)
}
