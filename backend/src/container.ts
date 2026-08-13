import { DataSource } from 'typeorm';

import { UserRepository } from './repositories/UserRepository';
import { ProjectRepository } from './repositories/ProjectRepository';
import { ProjectMemberRepository } from './repositories/ProjectMemberRepository';
import { TaskRepository } from './repositories/TaskRepository';
import { CommentRepository } from './repositories/CommentRepository';
import { NotificationRepository } from './repositories/NotificationRepository';

import { AuthService } from './services/AuthService';
import { ProjectService } from './services/ProjectService';
import { TaskService } from './services/TaskService';
import { CommentService } from './services/CommentService';
import { NotificationService } from './services/NotificationService';

import { AuthController } from './controllers/AuthController';
import { ProjectController } from './controllers/ProjectController';
import { TaskController } from './controllers/TaskController';
import { CommentController } from './controllers/CommentController';
import { NotificationController } from './controllers/NotificationController';

/**
 * Composition Root (a lightweight, explicit alternative to a DI framework
 * like InversifyJS). This is the ONLY place in the application that wires
 * concrete repository implementations into services — every service class
 * itself only ever references the IXxxRepository interfaces. Swapping
 * TypeORM for another persistence technology means changing this file and
 * the repositories/ folder only; controllers and services are untouched.
 */
export function buildContainer(dataSource: DataSource) {
  // Repositories (Repository Pattern)
  const userRepository = new UserRepository(dataSource);
  const projectRepository = new ProjectRepository(dataSource);
  const projectMemberRepository = new ProjectMemberRepository(dataSource);
  const taskRepository = new TaskRepository(dataSource);
  const commentRepository = new CommentRepository(dataSource);
  const notificationRepository = new NotificationRepository(dataSource);

  // Services (Service Layer Pattern) — constructor-injected with interfaces
  const notificationService = new NotificationService(notificationRepository);
  const authService = new AuthService(userRepository);
  const projectService = new ProjectService(projectRepository, projectMemberRepository, userRepository);
  const taskService = new TaskService(taskRepository, projectMemberRepository, notificationService);
  const commentService = new CommentService(
    commentRepository,
    taskRepository,
    projectMemberRepository,
    notificationService,
  );

  // Controllers (MVC "Controller")
  const authController = new AuthController(authService);
  const projectController = new ProjectController(projectService);
  const taskController = new TaskController(taskService);
  const commentController = new CommentController(commentService);
  const notificationController = new NotificationController(notificationService);

  return {
    repositories: {
      userRepository,
      projectRepository,
      projectMemberRepository,
      taskRepository,
      commentRepository,
      notificationRepository,
    },
    services: { authService, projectService, taskService, commentService, notificationService },
    controllers: {
      authController,
      projectController,
      taskController,
      commentController,
      notificationController,
    },
  };
}

export type Container = ReturnType<typeof buildContainer>;
