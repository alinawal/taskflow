import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/CommentService';

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.commentService.addComment(req.params.taskId, req.user!.sub, req.body);
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  };

  listForTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await this.commentService.listForTask(req.params.taskId, req.user!.sub);
      res.status(200).json(comments);
    } catch (err) {
      next(err);
    }
  };
}
