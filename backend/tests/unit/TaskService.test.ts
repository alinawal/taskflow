import { TaskService } from '../../src/services/TaskService';
import { NotificationService } from '../../src/services/NotificationService';
import {
  FakeTaskRepository,
  FakeProjectMemberRepository,
  FakeNotificationRepository,
} from '../fixtures/fakeRepositories';
import { AppError } from '../../src/utils/AppError';
import { TaskStatus } from '../../src/entities/Task';

describe('TaskService (unit)', () => {
  let taskRepository: FakeTaskRepository;
  let memberRepository: FakeProjectMemberRepository;
  let notificationRepository: FakeNotificationRepository;
  let notificationService: NotificationService;
  let taskService: TaskService;

  const PROJECT_ID = 'project-1';
  const MEMBER_ID = 'member-1';
  const ASSIGNEE_ID = 'assignee-1';
  const OUTSIDER_ID = 'outsider-1';

  beforeEach(async () => {
    taskRepository = new FakeTaskRepository();
    memberRepository = new FakeProjectMemberRepository();
    notificationRepository = new FakeNotificationRepository();
    notificationService = new NotificationService(notificationRepository);
    taskService = new TaskService(taskRepository, memberRepository, notificationService);

    await memberRepository.create({ projectId: PROJECT_ID, userId: MEMBER_ID, role: 'CONTRIBUTOR' as any });
    await memberRepository.create({ projectId: PROJECT_ID, userId: ASSIGNEE_ID, role: 'CONTRIBUTOR' as any });
  });

  it('creates a task within a project the requester belongs to', async () => {
    const task = await taskService.createTask(PROJECT_ID, MEMBER_ID, { title: 'Write tests' } as any);
    expect(task.title).toBe('Write tests');
    expect(task.status).toBe(TaskStatus.TODO);
  });

  it('rejects task creation from a user who is not a project member', async () => {
    await expect(
      taskService.createTask(PROJECT_ID, OUTSIDER_ID, { title: 'Sneaky task' } as any),
    ).rejects.toThrow(AppError);
  });

  it('rejects assigning a task to someone outside the project', async () => {
    await expect(
      taskService.createTask(PROJECT_ID, MEMBER_ID, {
        title: 'Task',
        assigneeId: OUTSIDER_ID,
      } as any),
    ).rejects.toThrow(AppError);
  });

  it('notifies the assignee when a task is created with an assignee', async () => {
    await taskService.createTask(PROJECT_ID, MEMBER_ID, {
      title: 'Design schema',
      assigneeId: ASSIGNEE_ID,
    } as any);

    const notifications = await notificationRepository.findByRecipient(ASSIGNEE_ID);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('TASK_ASSIGNED');
  });

  it('notifies the assignee again when status changes', async () => {
    const task = await taskService.createTask(PROJECT_ID, MEMBER_ID, {
      title: 'Build UI',
      assigneeId: ASSIGNEE_ID,
    } as any);

    await taskService.updateTask(task.id, MEMBER_ID, { status: TaskStatus.IN_PROGRESS } as any);

    const notifications = await notificationRepository.findByRecipient(ASSIGNEE_ID);
    expect(notifications).toHaveLength(2);
    expect(notifications[1].type).toBe('TASK_STATUS_CHANGED');
  });

  it('throws AppError with 404 when updating a non-existent task', async () => {
    await expect(
      taskService.updateTask('does-not-exist', MEMBER_ID, { title: 'X' } as any),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deletes a task successfully', async () => {
    const task = await taskService.createTask(PROJECT_ID, MEMBER_ID, { title: 'Temp task' } as any);
    await taskService.deleteTask(task.id, MEMBER_ID);
    await expect(taskService.getTask(task.id, MEMBER_ID)).rejects.toMatchObject({ statusCode: 404 });
  });
});
