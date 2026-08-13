import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectMemberRepository } from '../repositories/ProjectMemberRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { hashPassword } from './password';
import { UserRole } from '../entities/User';
import { ProjectRole } from '../entities/ProjectMember';
import { TaskPriority, TaskStatus } from '../entities/Task';

/**
 * Seeds the database with a demo admin, two members, one project and a
 * handful of tasks spread across the Kanban columns — enough to give a
 * live demo (and a screenshot-ready UI) immediately after `npm run seed`.
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = new UserRepository(AppDataSource);
  const projectRepo = new ProjectRepository(AppDataSource);
  const memberRepo = new ProjectMemberRepository(AppDataSource);
  const taskRepo = new TaskRepository(AppDataSource);

  const password = await hashPassword('Password123!');

  const admin = await userRepo.create({
    name: 'Amina Admin',
    email: 'admin@taskflow.dev',
    passwordHash: password,
    role: UserRole.ADMIN,
  });

  const alice = await userRepo.create({
    name: 'Alice Njoroge',
    email: 'alice@taskflow.dev',
    passwordHash: password,
    role: UserRole.MEMBER,
  });

  const brian = await userRepo.create({
    name: 'Brian Otieno',
    email: 'brian@taskflow.dev',
    passwordHash: password,
    role: UserRole.MEMBER,
  });

  const project = await projectRepo.create({
    name: 'TaskFlow Launch',
    description: 'Ship the TaskFlow MVP for the SWE2030XA final demo.',
    ownerId: admin.id,
  });

  await memberRepo.create({ projectId: project.id, userId: admin.id, role: ProjectRole.OWNER });
  await memberRepo.create({ projectId: project.id, userId: alice.id, role: ProjectRole.CONTRIBUTOR });
  await memberRepo.create({ projectId: project.id, userId: brian.id, role: ProjectRole.CONTRIBUTOR });

  await taskRepo.create({
    title: 'Design database schema',
    description: 'Model users, projects, tasks, comments and notifications.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: project.id,
    assigneeId: admin.id,
  });

  await taskRepo.create({
    title: 'Implement authentication API',
    description: 'JWT-based register/login endpoints with hashed passwords.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: project.id,
    assigneeId: alice.id,
  });

  await taskRepo.create({
    title: 'Build Kanban board UI',
    description: 'Drag-and-drop task board grouped by status.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2026-07-20',
    projectId: project.id,
    assigneeId: brian.id,
  });

  await taskRepo.create({
    title: 'Write integration tests',
    description: 'Cover auth, project, task and comment endpoints end-to-end.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: '2026-07-22',
    projectId: project.id,
    assigneeId: alice.id,
  });

  await taskRepo.create({
    title: 'Set up CI/CD pipeline',
    description: 'GitHub Actions workflow running lint, tests and Docker build.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '2026-07-25',
    projectId: project.id,
    assigneeId: brian.id,
  });

  await taskRepo.create({
    title: 'Prepare final presentation',
    description: 'Slides, demo script and rubric evidence matrix.',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    dueDate: '2026-07-28',
    projectId: project.id,
    assigneeId: admin.id,
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:');
  // eslint-disable-next-line no-console
  console.log('  admin@taskflow.dev / Password123!  (ADMIN)');
  // eslint-disable-next-line no-console
  console.log('  alice@taskflow.dev / Password123!  (MEMBER)');
  // eslint-disable-next-line no-console
  console.log('  brian@taskflow.dev / Password123!  (MEMBER)');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
