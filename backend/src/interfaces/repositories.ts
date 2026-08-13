import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { Task } from '../entities/Task';
import { Comment } from '../entities/Comment';
import { Notification } from '../entities/Notification';

/**
 * Generic CRUD contract. Kept intentionally small (Interface Segregation
 * Principle) so concrete repositories only implement what they need, and
 * consumers only depend on the methods they actually use.
 */
export interface IReadRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}

export interface IWriteRepository<T, ID = string> {
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

export interface IUserRepository extends IReadRepository<User>, IWriteRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}

export interface IProjectRepository extends IReadRepository<Project>, IWriteRepository<Project> {
  findByOwner(ownerId: string): Promise<Project[]>;
  findForUser(userId: string): Promise<Project[]>;
}

export interface IProjectMemberRepository
  extends IReadRepository<ProjectMember>,
    IWriteRepository<ProjectMember> {
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null>;
  findByProject(projectId: string): Promise<ProjectMember[]>;
  deleteByProjectAndUser(projectId: string, userId: string): Promise<boolean>;
}

export interface ITaskRepository extends IReadRepository<Task>, IWriteRepository<Task> {
  findByProject(projectId: string): Promise<Task[]>;
  findByAssignee(assigneeId: string): Promise<Task[]>;
}

export interface ICommentRepository extends IReadRepository<Comment>, IWriteRepository<Comment> {
  findByTask(taskId: string): Promise<Comment[]>;
}

export interface INotificationRepository
  extends IReadRepository<Notification>,
    IWriteRepository<Notification> {
  findByRecipient(recipientId: string): Promise<Notification[]>;
  markAllRead(recipientId: string): Promise<void>;
}
