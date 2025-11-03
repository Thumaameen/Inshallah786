import { Router, Request, Response } from 'express';
import { sapsCRCService } from '../services/saps-crc';
import { validateIdNumber } from '../utils/validators';
import { asyncHandler } from '../middleware/async-handler';
import { rateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/auth';
import { validateRequestSchema } from '../middleware/validate-schema';
import { logger } from '../utils/logger';

interface CRCRequest extends Request {
  body: {
    idNumber: string;
  };
  id?: string;
}

const router = Router();

// Rate limiting for SAPS CRC endpoints
const crcRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

/**
 * @route GET /api/saps/crc/status
 * @desc Get SAPS CRC service status
 * @access Private
 */
router.get('/status', 
  requireAuth,
  crcRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const status = await sapsCRCService.getStatus();
      logger.info('SAPS CRC status check successful');
      res.json(status);
    } catch (error) {
      logger.error('SAPS CRC status check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check SAPS CRC service status'
      });
    }
  }));

/**
 * @route POST /api/saps/crc/verify
 * @desc Verify criminal record for an ID number
 * @access Private
 */
router.post('/verify',
  requireAuth,
  crcRateLimit,
  validateRequestSchema<{idNumber: string}>({
    type: 'object',
    required: ['idNumber'],
    properties: {
      idNumber: {
        type: 'string',
        minLength: 13,
        maxLength: 13,
        nullable: false
      }
    }
  }),
  asyncHandler(async (req: CRCRequest, res: Response) => {
    const { idNumber } = req.body;

    // Validate ID number format
    if (!validateIdNumber(idNumber)) {
      logger.warn(`Invalid ID number format attempted: ${idNumber.substring(0, 6)}****`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID number format'
      });
    }

    try {
      const result = await sapsCRCService.verifyRecord(idNumber);
      
      // Log successful verification without exposing full ID
      logger.info(`SAPS CRC verification completed for ID: ${idNumber.substring(0, 6)}****`);
      
      res.json({
        ...result,
        requestId: req.id // Add request ID for tracking
      });
    } catch (error) {
      logger.error('SAPS CRC verification failed:', {
        error,
        idNumberPrefix: idNumber.substring(0, 6),
        requestId: req.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to verify criminal record',
        requestId: req.id
      });
    }
  }));

export const sapsCRCRouter = router;