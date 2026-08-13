export type UserRole = 'ADMIN' | 'MEMBER';
export type ProjectRole = 'OWNER' | 'CONTRIBUTOR';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'NEW_COMMENT'
  | 'ADDED_TO_PROJECT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  assignee?: User | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: User;
}
