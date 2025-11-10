import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// Extended request interface to include request ID
interface RequestWithId extends Request {
  id?: string;
}

/**
 * Request schema validation middleware
 * This function is a placeholder and does not perform actual schema validation due to the removal of Ajv.
 * It should be reimplemented with a different validation library or logic if schema validation is required.
 * @param schema The JSON schema to validate against (currently unused)
 */
export function validateRequestSchema<T>(schema: any) {
  // Schema compilation and validation logic removed due to Ajv dependency removal.
  // This function now acts as a middleware that bypasses schema validation.
  // If validation is needed, a new validation library or approach should be integrated here.

  return (req: RequestWithId, res: Response, next: NextFunction) => {
    logger.warn('Schema validation is disabled due to Ajv removal.');
    // In a real scenario, you would implement validation here or remove this middleware.
    next();
  };
}