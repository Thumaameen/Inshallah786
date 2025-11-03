import { Request, Response, NextFunction } from 'express';
import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
import { logger } from '../utils/logger';

// Extended request interface to include request ID
interface RequestWithId extends Request {
  id?: string;
}

// Initialize Ajv with strict mode and all errors
const ajv = new Ajv({ 
  allErrors: true,
  strict: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true
});

/**
 * Request schema validation middleware
 * @param schema The JSON schema to validate against
 */
export function validateRequestSchema<T>(schema: JSONSchemaType<T>) {
  let validate: ValidateFunction<T>;
  
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    logger.error('Schema compilation error:', error);
    throw new Error('Invalid schema configuration');
  }
  
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    try {
      const valid = validate(req.body);
      
      if (!valid) {
        const errors = validate.errors?.map((err: ErrorObject) => ({
          field: err.instancePath || 'request',
          message: err.message,
          params: err.params
        }));

        logger.warn('Request validation failed:', {
          path: req.path,
          errors,
          body: JSON.stringify(req.body).substring(0, 200) // Truncate for logging
        });

        return res.status(400).json({
          status: 'error',
          message: 'Invalid request data',
          errors,
          requestId: req.id
        });
      }
      
      // Validated data is in req.body
      req.body = req.body; // Ensure type safety
      next();
    } catch (error) {
      logger.error('Validation processing error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Schema validation failed',
        requestId: req.id
      });
    }
  };
}