import { ITaskRepository, IProjectMemberRepository } from '../interfaces/repositories';
import { CreateTaskInput, UpdateTaskInput } from '../dto/schemas';
import { AppError } from '../utils/AppError';
import { Task } from '../entities/Task';
import { NotificationType } from '../entities/Notification';
import { NotificationService } from './NotificationService';

/**
 * TaskService owns task lifecycle rules within a project, including the
 * cross-cutting concern of notifying an assignee. It depends on
 * NotificationService (composition, not inheritance) rather than
 * duplicating notification logic — a clean example of favoring
 * composition and single responsibility over a "god service".
 */
export class TaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly memberRepository: IProjectMemberRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createTask(projectId: string, requesterId: string, input: CreateTaskInput): Promise<Task> {
    await this.assertIsMember(projectId, requesterId);

    if (input.assigneeId) {
      await this.assertIsMember(projectId, input.assigneeId);
    }

    const task = await this.taskRepository.create({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      assigneeId: input.assigneeId ?? null,
      projectId,
    });

    if (task.assigneeId) {
      await this.notificationService.notify(
        task.assigneeId,
        NotificationType.TASK_ASSIGNED,
        `You were assigned to task "${task.title}"`,
      );
    }

    return task;
  }

  async listTasksForProject(projectId: string, requesterId: string): Promise<Task[]> {
    await this.assertIsMember(projectId, requesterId);
    return this.taskRepository.findByProject(projectId);
  }

  async listMyTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByAssignee(userId);
  }

  async getTask(taskId: string, requesterId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');
    await this.assertIsMember(task.projectId, requesterId);
    return task;
  }

  async updateTask(taskId: string, requesterId: string, input: UpdateTaskInput): Promise<Task> {
    const task = await this.getTask(taskId, requesterId);

    if (input.assigneeId !== undefined && input.assigneeId !== null) {
      await this.assertIsMember(task.projectId, input.assigneeId);
    }

    const previousStatus = task.status;
    const updated = await this.taskRepository.update(taskId, input);
    if (!updated) throw AppError.notFound('Task not found');

    if (input.assigneeId && input.assigneeId !== task.assigneeId) {
      await this.notificationService.notify(
        input.assigneeId,
        NotificationType.TASK_ASSIGNED,
        `You were assigned to task "${updated.title}"`,
      );
    }

    if (input.status && input.status !== previousStatus && updated.assigneeId) {
      await this.notificationService.notify(
        updated.assigneeId,
        NotificationType.TASK_STATUS_CHANGED,
        `Task "${updated.title}" moved to ${input.status.replace('_', ' ')}`,
      );
    }

    return updated;
  }

  async deleteTask(taskId: string, requesterId: string): Promise<void> {
    const task = await this.getTask(taskId, requesterId);
    await this.taskRepository.delete(task.id);
  }

  private async assertIsMember(projectId: string, userId: string): Promise<void> {
    const membership = await this.memberRepository.findByProjectAndUser(projectId, userId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this project');
    }
  }
}
