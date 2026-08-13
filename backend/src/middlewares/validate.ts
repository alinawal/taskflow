import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Higher-order middleware: given a zod schema, returns an Express
 * middleware that validates req.body and replaces it with the parsed
 * (type-safe) value, or forwards a 400 AppError with field-level details.
 * Keeping this generic avoids repeating validation boilerplate in every
 * controller (SRP: controllers only orchestrate, they don't validate).
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(AppError.badRequest('Validation failed', details));
    }
    req.body = result.data;
    next();
  };
}
