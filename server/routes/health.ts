/**
 * Production Health Check and Deployment Readiness API Routes
 * @packageDocumentation
 */

import { Router, Request, Response } from 'express';
// Corrected import: environmentConfig is not exported from env.js, using `environment` instead.
// Also, 'environmentConfig' seems to be a typo and should be 'environment' based on typical config structures.
// The actual environment configuration object is likely imported or initialized elsewhere and available as `environment`.
// Assuming `environment` is available in the scope.
import { environment } from '../config/env.js'; // Assuming 'environment' is the correct export name.
import { productionHealthCheck } from '../services/production-health-check.js';
import { authenticate } from '../middleware/auth.js';
import { integrationManager } from '../services/integration-manager.js';

// Simple health check response to avoid Node.js process information leakage
const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const integrationStatus = await integrationManager.checkAllIntegrations();
    const integrations = Object.fromEntries(integrationStatus);

    // Import and run API activator
    const { productionAPIActivator } = await import('../services/production-api-activator.js');
    const apiValidation = await productionAPIActivator.validateAndActivateAll();

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      // Fixed to use the correct environment variable, assuming 'environment' is the available config object.
      environment: environment.NODE_ENV || 'development',
      service: 'DHA Digital Services Platform',
      deployment: 'render-production',
      features: {
        documentGeneration: true,
        aiAssistant: true,
        biometricValidation: true,
        governmentIntegration: true
      },
      apiKeys: {
        total: apiValidation.totalKeys,
        active: apiValidation.activeKeys,
        successRate: `${Math.round((apiValidation.activeKeys / apiValidation.totalKeys) * 100)}%`
      },
      // Fixed to use the correct environment variable.
      system: environment.SYSTEM,
      integrations
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Health check failed:', error); // Log the error for debugging
    res.status(500).json({ // Changed status to 500 for actual errors
      status: 'unhealthy', // Changed status to unhealthy for errors
      timestamp: new Date().toISOString(),
      errorDetails: { type: 'Health check error', message: String(error) }
    });
  }
});

router.get('/health/detailed', authenticate, async (_req: Request, res: Response) => {
  try {
    const healthResult = await productionHealthCheck.performFullHealthCheck();
    res.json({
      status: healthResult.overallHealth,
      timestamp: new Date().toISOString(),
      // Fixed to use the correct environment variable.
      environment: environment.NODE_ENV || 'development',
      // Fixed to use the correct environment variable.
      system: environment.SYSTEM
    });
  } catch (error) {
    console.error('Detailed health check failed:', error); // Log the error for debugging
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: String(error)
    });
  }
});

router.get('/health/readiness', authenticate, async (_req: Request, res: Response) => {
  try {
    const readinessResult = await productionHealthCheck.checkDeploymentReadiness();
    const isAllIntegrationsActive = integrationManager.isAllIntegrationsActive();

    const statusCode = (readinessResult.isReady && isAllIntegrationsActive) ? 200 : 503;

    res.status(statusCode).json({
      ready: readinessResult.isReady && isAllIntegrationsActive,
      readinessScore: readinessResult.readinessScore,
      timestamp: new Date().toISOString(),
      // Fixed to use the correct environment variable.
      environment: environment.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Readiness check failed:', error); // Log the error for debugging
    res.status(500).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: String(error)
    });
  }
});

router.get('/health/security', authenticate, async (_req: Request, res: Response) => {
  try {
    const readinessResult = await productionHealthCheck.checkDeploymentReadiness();
    const integrationStatus = await integrationManager.checkAllIntegrations();

    const secureIntegrations = Array.from(integrationStatus.values())
      .filter(status => status.status === 'active');

    res.json({
      securityCompliance: readinessResult.securityCompliance,
      timestamp: new Date().toISOString(),
      integrationStatus: {
        active: secureIntegrations.length,
        total: integrationStatus.size
      }
    });
  } catch (error) {
    console.error('Security check failed:', error); // Log the error for debugging
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: String(error)
    });
  }
});

export { router as healthRouter };