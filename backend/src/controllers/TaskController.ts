import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.createTask(req.params.projectId, req.user!.sub, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  listForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.listTasksForProject(req.params.projectId, req.user!.sub);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.listMyTasks(req.user!.sub);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.getTask(req.params.taskId, req.user!.sub);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.updateTask(req.params.taskId, req.user!.sub, req.body);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.taskService.deleteTask(req.params.taskId, req.user!.sub);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
