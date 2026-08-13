import type {
  AuthResult,
  Project,
  ProjectMember,
  Task,
  Comment,
  AppNotification,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = localStorage.getItem('taskflow_token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('taskflow_token', token);
  } else {
    localStorage.removeItem('taskflow_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Single low-level request helper. Every API method funnels through here,
 * so auth headers, JSON parsing, and error translation are handled in
 * exactly one place (DRY, Single Responsibility).
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'Request failed', body.details);
  }

  return body as T;
}

export const api = {
  auth: {
    register: (input: { name: string; email: string; password: string }) =>
      request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    login: (input: { email: string; password: string }) =>
      request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    me: () => request<AuthResult['user']>('/auth/me'),
  },
  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (input: { name: string; description?: string }) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, input: { name?: string; description?: string }) =>
      request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
    listMembers: (id: string) => request<ProjectMember[]>(`/projects/${id}/members`),
    addMember: (id: string, email: string) =>
      request<ProjectMember>(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    removeMember: (id: string, userId: string) =>
      request<void>(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
  },
  tasks: {
    listForProject: (projectId: string) => request<Task[]>(`/projects/${projectId}/tasks`),
    listMine: () => request<Task[]>('/tasks/mine'),
    create: (
      projectId: string,
      input: {
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
      },
    ) =>
      request<Task>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, input: Partial<Task>) =>
      request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  comments: {
    listForTask: (taskId: string) => request<Comment[]>(`/tasks/${taskId}/comments`),
    create: (taskId: string, body: string) =>
      request<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
  },
  notifications: {
    list: () => request<AppNotification[]>('/notifications'),
    markAllRead: () => request<void>('/notifications/mark-all-read', { method: 'POST' }),
  },
};
