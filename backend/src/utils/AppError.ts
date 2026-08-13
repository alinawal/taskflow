/**
 * Typed application error carrying an HTTP status code, so the centralized
 * error-handling middleware (src/middlewares/errorHandler.ts) can translate
 * any thrown error into a consistent JSON response without each controller
 * needing its own try/catch/status logic.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, message, details);
  }
  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(401, message);
  }
  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(403, message);
  }
  static notFound(message = 'Resource not found'): AppError {
    return new AppError(404, message);
  }
  static conflict(message: string): AppError {
    return new AppError(409, message);
  }
}
