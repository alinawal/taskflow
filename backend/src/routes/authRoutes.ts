import { Router } from 'express';
import { Container } from '../container';
import { validateBody } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema } from '../dto/schemas';

export function buildAuthRoutes(container: Container): Router {
  const router = Router();
  const { authController } = container.controllers;

  router.post('/register', validateBody(registerSchema), authController.register);
  router.post('/login', validateBody(loginSchema), authController.login);
  router.get('/me', authenticate, authController.me);

  return router;
}
