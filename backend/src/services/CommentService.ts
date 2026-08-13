import {
  ICommentRepository,
  ITaskRepository,
  IProjectMemberRepository,
} from '../interfaces/repositories';
import { CreateCommentInput } from '../dto/schemas';
import { AppError } from '../utils/AppError';
import { Comment } from '../entities/Comment';
import { NotificationType } from '../entities/Notification';
import { NotificationService } from './NotificationService';

export class CommentService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly memberRepository: IProjectMemberRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async addComment(taskId: string, authorId: string, input: CreateCommentInput): Promise<Comment> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const membership = await this.memberRepository.findByProjectAndUser(task.projectId, authorId);
    if (!membership) throw AppError.forbidden('You are not a member of this project');

    const comment = await this.commentRepository.create({
      taskId,
      authorId,
      body: input.body,
    });

    if (task.assigneeId && task.assigneeId !== authorId) {
      await this.notificationService.notify(
        task.assigneeId,
        NotificationType.NEW_COMMENT,
        `New comment on task "${task.title}"`,
      );
    }

    return comment;
  }

  async listForTask(taskId: string, requesterId: string): Promise<Comment[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const membership = await this.memberRepository.findByProjectAndUser(task.projectId, requesterId);
    if (!membership) throw AppError.forbidden('You are not a member of this project');

    return this.commentRepository.findByTask(taskId);
  }
}
