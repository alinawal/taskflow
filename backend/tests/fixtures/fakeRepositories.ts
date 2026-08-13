import { randomUUID } from 'crypto';
import { User } from '../../src/entities/User';
import { Project } from '../../src/entities/Project';
import { ProjectMember } from '../../src/entities/ProjectMember';
import { Task } from '../../src/entities/Task';
import { Comment } from '../../src/entities/Comment';
import { Notification } from '../../src/entities/Notification';
import {
  IUserRepository,
  IProjectRepository,
  IProjectMemberRepository,
  ITaskRepository,
  ICommentRepository,
  INotificationRepository,
} from '../../src/interfaces/repositories';

/**
 * Simple in-memory implementations of every repository interface.
 * Because services depend on interfaces (not TypeORM classes), unit tests
 * can substitute these fakes with zero mocking-framework overhead and zero
 * database — this is the Liskov Substitution Principle proving itself
 * useful in practice: fakes are drop-in substitutes for the real thing.
 */
export class FakeUserRepository implements IUserRepository {
  private store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<User[]> {
    return [...this.store.values()];
  }
  async findByEmail(email: string): Promise<User | null> {
    return [...this.store.values()].find((u) => u.email === email) ?? null;
  }
  async create(data: Partial<User>): Promise<User> {
    const user = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data } as User;
    this.store.set(user.id, user);
    return user;
  }
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class FakeProjectRepository implements IProjectRepository {
  private store = new Map<string, Project>();

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<Project[]> {
    return [...this.store.values()];
  }
  async findByOwner(ownerId: string): Promise<Project[]> {
    return [...this.store.values()].filter((p) => p.ownerId === ownerId);
  }
  async findForUser(): Promise<Project[]> {
    return [...this.store.values()];
  }
  async create(data: Partial<Project>): Promise<Project> {
    const project = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data } as Project;
    this.store.set(project.id, project);
    return project;
  }
  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class FakeProjectMemberRepository implements IProjectMemberRepository {
  private store = new Map<string, ProjectMember>();

  async findById(id: string): Promise<ProjectMember | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<ProjectMember[]> {
    return [...this.store.values()];
  }
  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    return (
      [...this.store.values()].find((m) => m.projectId === projectId && m.userId === userId) ?? null
    );
  }
  async findByProject(projectId: string): Promise<ProjectMember[]> {
    return [...this.store.values()].filter((m) => m.projectId === projectId);
  }
  async deleteByProjectAndUser(projectId: string, userId: string): Promise<boolean> {
    const match = [...this.store.values()].find(
      (m) => m.projectId === projectId && m.userId === userId,
    );
    if (!match) return false;
    return this.store.delete(match.id);
  }
  async create(data: Partial<ProjectMember>): Promise<ProjectMember> {
    const member = { id: randomUUID(), joinedAt: new Date(), ...data } as ProjectMember;
    this.store.set(member.id, member);
    return member;
  }
  async update(id: string, data: Partial<ProjectMember>): Promise<ProjectMember | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class FakeTaskRepository implements ITaskRepository {
  private store = new Map<string, Task>();

  async findById(id: string): Promise<Task | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<Task[]> {
    return [...this.store.values()];
  }
  async findByProject(projectId: string): Promise<Task[]> {
    return [...this.store.values()].filter((t) => t.projectId === projectId);
  }
  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return [...this.store.values()].filter((t) => t.assigneeId === assigneeId);
  }
  async create(data: Partial<Task>): Promise<Task> {
    const task = { id: randomUUID(), createdAt: new Date(), updatedAt: new Date(), ...data } as Task;
    this.store.set(task.id, task);
    return task;
  }
  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class FakeCommentRepository implements ICommentRepository {
  private store = new Map<string, Comment>();

  async findById(id: string): Promise<Comment | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<Comment[]> {
    return [...this.store.values()];
  }
  async findByTask(taskId: string): Promise<Comment[]> {
    return [...this.store.values()].filter((c) => c.taskId === taskId);
  }
  async create(data: Partial<Comment>): Promise<Comment> {
    const comment = { id: randomUUID(), createdAt: new Date(), ...data } as Comment;
    this.store.set(comment.id, comment);
    return comment;
  }
  async update(id: string, data: Partial<Comment>): Promise<Comment | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class FakeNotificationRepository implements INotificationRepository {
  private store = new Map<string, Notification>();

  async findById(id: string): Promise<Notification | null> {
    return this.store.get(id) ?? null;
  }
  async findAll(): Promise<Notification[]> {
    return [...this.store.values()];
  }
  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return [...this.store.values()].filter((n) => n.recipientId === recipientId);
  }
  async markAllRead(recipientId: string): Promise<void> {
    for (const [id, n] of this.store.entries()) {
      if (n.recipientId === recipientId) this.store.set(id, { ...n, read: true });
    }
  }
  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = { id: randomUUID(), createdAt: new Date(), read: false, ...data } as Notification;
    this.store.set(notification.id, notification);
    return notification;
  }
  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
