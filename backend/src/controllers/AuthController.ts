import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

/**
 * Controllers translate HTTP <-> service calls only. No business logic
 * lives here (SRP) — that keeps them thin, easy to test, and reusable
 * if TaskFlow ever grew a second transport (e.g. a CLI or GraphQL API)
 * on top of the same service layer.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getProfile(req.user!.sub);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
}
