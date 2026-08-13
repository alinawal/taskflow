import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Single place where every error thrown anywhere in the request lifecycle
 * is translated into a consistent JSON response. Keeps controllers and
 * services free of repetitive try/catch + res.status(...).json(...) code.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(env.isProduction ? {} : { debug: err instanceof Error ? err.message : String(err) }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
