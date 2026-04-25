const BASE  = 'https://api.clickup.com/api/v2';
const TOKEN = process.env.CLICKUP_API_TOKEN!;

async function cu(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: TOKEN,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`ClickUp ${res.status}: ${msg}`);
  }
  return res.json();
}

// Espaços do workspace
export const getSpaces = (teamId: string) =>
  cu(`/team/${teamId}/space?archived=false`);

// Pastas de um espaço
export const getFolders = (spaceId: string) =>
  cu(`/space/${spaceId}/folder?archived=false`);

// Listas de uma pasta (cada lista = sprint ou backlog)
export const getLists = (folderId: string) =>
  cu(`/folder/${folderId}/list?archived=false`);

// Listas sem pasta (folderless)
export const getFolderlessLists = (spaceId: string) =>
  cu(`/space/${spaceId}/list?archived=false`);

// Tarefas de uma lista
export const getTasks = (listId: string, extra?: Record<string, string>) => {
  const qs = new URLSearchParams({
    include_closed: 'true',
    subtasks: 'true',
    ...extra,
  }).toString();
  return cu(`/list/${listId}/task?${qs}`);
};

// Tarefa individual
export const getTask = (taskId: string) => cu(`/task/${taskId}`);

// Atualiza status de uma tarefa
export const updateTaskStatus = (taskId: string, status: string) =>
  cu(`/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    next: undefined,
  });

// Cria comentário numa tarefa
export const createComment = (taskId: string, text: string) =>
  cu(`/task/${taskId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: text }),
    next: undefined,
  });
