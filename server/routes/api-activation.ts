
import { Router, Request, Response } from 'express';
import { productionAPIActivator } from '../services/production-api-activator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/activation/status - Check activation status of all APIs
 */
router.get('/activation/status', authenticate, async (_req: Request, res: Response) => {
  try {
    const validation = await productionAPIActivator.validateAndActivateAll();
    
    res.json({
      success: validation.success,
      timestamp: new Date().toISOString(),
      summary: {
        total: validation.totalKeys,
        active: validation.activeKeys,
        successRate: Math.round((validation.activeKeys / validation.totalKeys) * 100)
      },
      providers: validation.results,
      activeProviders: productionAPIActivator.getActiveProviders()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Activation check failed'
    });
  }
});

/**
 * POST /api/activation/revalidate - Force revalidation of all API keys
 */
router.post('/activation/revalidate', authenticate, async (_req: Request, res: Response) => {
  try {
    const validation = await productionAPIActivator.validateAndActivateAll();
    
    res.json({
      success: validation.success,
      message: 'API keys revalidated successfully',
      timestamp: new Date().toISOString(),
      summary: {
        total: validation.totalKeys,
        active: validation.activeKeys,
        successRate: Math.round((validation.activeKeys / validation.totalKeys) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Revalidation failed'
    });
  }
});

export { router as apiActivationRouter };
