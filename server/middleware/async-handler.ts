import { Request, Response, NextFunction } from 'express';

// Extended request interface to include request ID
interface RequestWithId extends Request {
  id?: string;
}

/**
 * Async handler middleware to catch errors in async route handlers
 * This eliminates the need for try/catch blocks in every route
 */
type AsyncHandler = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncHandler) =>
  (req: RequestWithId, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log error if logger is available
      if (res.locals?.logger) {
        res.locals.logger.error('Route handler error:', {
          error,
          requestId: req.id,
          path: req.path,
          method: req.method
        });
      }

      // Send error response with safe error information
      res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
        requestId: req.id,
        timestamp: new Date().toISOString()
      });
    });
  };