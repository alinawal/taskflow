import { Router } from 'express';
import { Container } from '../container';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
} from '../dto/schemas';

export function buildProjectRoutes(container: Container): Router {
  const router = Router();
  const { projectController, taskController } = container.controllers;

  router.use(authenticate);

  // Projects
  router.post('/', validateBody(createProjectSchema), projectController.create);
  router.get('/', projectController.listMine);
  router.get('/:projectId', projectController.getOne);
  router.patch('/:projectId', validateBody(updateProjectSchema), projectController.update);
  router.delete('/:projectId', projectController.remove);

  // Membership
  router.get('/:projectId/members', projectController.listMembers);
  router.post('/:projectId/members', validateBody(addMemberSchema), projectController.addMember);
  router.delete('/:projectId/members/:userId', projectController.removeMember);

  // Tasks nested under a project
  router.post('/:projectId/tasks', validateBody(createTaskSchema), taskController.create);
  router.get('/:projectId/tasks', taskController.listForProject);

  return router;
}

export function buildTaskRoutes(container: Container): Router {
  const router = Router();
  const { taskController, commentController } = container.controllers;

  router.use(authenticate);

  router.get('/mine', taskController.listMine);
  router.get('/:taskId', taskController.getOne);
  router.patch('/:taskId', validateBody(updateTaskSchema), taskController.update);
  router.delete('/:taskId', taskController.remove);

  router.get('/:taskId/comments', commentController.listForTask);
  router.post('/:taskId/comments', validateBody(createCommentSchema), commentController.create);

  return router;
}

export function buildNotificationRoutes(container: Container): Router {
  const router = Router();
  const { notificationController } = container.controllers;

  router.use(authenticate);

  router.get('/', notificationController.listMine);
  router.post('/mark-all-read', notificationController.markAllRead);

  return router;
}
