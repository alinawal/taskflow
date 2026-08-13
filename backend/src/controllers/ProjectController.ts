import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.createProject(req.user!.sub, req.body);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.projectService.listProjectsForUser(req.user!.sub);
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.getProject(req.params.projectId, req.user!.sub);
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.updateProject(
        req.params.projectId,
        req.user!.sub,
        req.body,
      );
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.projectService.deleteProject(req.params.projectId, req.user!.sub);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.projectService.addMember(
        req.params.projectId,
        req.user!.sub,
        req.body.email,
      );
      res.status(201).json(member);
    } catch (err) {
      next(err);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.projectService.removeMember(req.params.projectId, req.user!.sub, req.params.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await this.projectService.listMembers(req.params.projectId, req.user!.sub);
      res.status(200).json(members);
    } catch (err) {
      next(err);
    }
  };
}
