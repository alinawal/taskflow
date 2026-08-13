import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await this.notificationService.listForUser(req.user!.sub);
      res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificationService.markAllRead(req.user!.sub);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
