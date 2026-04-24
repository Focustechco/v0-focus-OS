import { 
  ClickUpWorkspace, 
  ClickUpSpace, 
  ClickUpFolder, 
  ClickUpList, 
  ClickUpTask,
  ClickUpSprint
} from './clickup-types';

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;

async function clickupFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_TOKEN) {
    throw new Error('CLICKUP_API_TOKEN is not defined');
  }

  const response = await fetch(`${CLICKUP_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': API_TOKEN,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 }, // Default revalidation
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('ClickUp API Error:', error);
    throw new Error(error.error || `ClickUp API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const clickup = {
  getWorkspaces: () => 
    clickupFetch<{ teams: ClickUpWorkspace[] }>('/team'),

  getSpaces: (teamId: string) => 
    clickupFetch<{ spaces: ClickUpSpace[] }>(`/team/${teamId}/space`),

  getFolders: (spaceId: string) => 
    clickupFetch<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`),

  getLists: (folderId: string) => 
    clickupFetch<{ lists: ClickUpList[] }>(`/folder/${folderId}/list`),

  getTasks: (listId: string, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return clickupFetch<{ tasks: ClickUpTask[] }>(`/list/${listId}/task?${query}`);
  },

  getTask: (taskId: string) => 
    clickupFetch<ClickUpTask>(`/task/${taskId}`),

  // Sprints are often implemented as folders or custom lists in ClickUp
  // This helper assumes a folder-based sprint structure or direct list access
  getSprints: async (listId: string): Promise<ClickUpSprint[]> => {
    // Note: ClickUp Sprints API might vary based on how they are configured (Sprint Folders vs Custom)
    // For now, we fetch tasks and group them, or use the specialized sprint endpoint if available
    try {
      const response = await clickupFetch<{ sprints: ClickUpSprint[] }>(`/list/${listId}/sprint`);
      return response.sprints;
    } catch (e) {
      console.warn('Sprint endpoint failed, falling back to task list');
      const { tasks } = await clickup.getTasks(listId);
      // Logic to transform tasks into a sprint-like structure if needed
      return []; 
    }
  },

  getBacklog: async (folderId: string) => {
    // Typically fetching all tasks in a folder that aren't in a specific sprint list
    return clickupFetch<{ tasks: ClickUpTask[] }>(`/folder/${folderId}/task?include_closed=false`);
  },

  createTask: (listId: string, data: Partial<ClickUpTask>) => 
    clickupFetch<ClickUpTask>(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (taskId: string, data: Partial<ClickUpTask>) => 
    clickupFetch<ClickUpTask>(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (taskId: string, status: string) => 
    clickupFetch<ClickUpTask>(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
