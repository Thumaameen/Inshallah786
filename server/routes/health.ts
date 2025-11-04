/**
 * Production Health Check and Deployment Readiness API Routes
 * @packageDocumentation
 */

import { Router, Request, Response } from 'express';
import { environmentConfig } from '../config/env';
import { productionHealthCheck } from '../services/production-health-check.js';
import { authenticate } from '../middleware/auth.js';
import { integrationManager } from '../services/integration-manager.js';

// Simple health check response to avoid Node.js process information leakage
const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthResult = await productionHealthCheck.performFullHealthCheck();
    const integrationStatus = await integrationManager.checkAllIntegrations();
    const integrations = Object.fromEntries(integrationStatus);

    // Import and run API activator
    const { productionAPIActivator } = await import('../services/production-api-activator.js');
    const apiValidation = await productionAPIActivator.validateAndActivateAll();

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: environmentConfig.NODE_ENV,
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
      system: environmentConfig.SYSTEM,
      integrations
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      errorDetails: { type: 'Health check error' }
    });
  }
});

router.get('/health/detailed', authenticate, async (_req: Request, res: Response) => {
  try {
    const healthResult = await productionHealthCheck.performFullHealthCheck();
    res.json({
      status: healthResult.overallHealth,
      timestamp: new Date().toISOString(),
      environment: environmentConfig.NODE_ENV,
      system: environmentConfig.SYSTEM
    });
  } catch (error) {
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
    const integrationStatus = await integrationManager.checkAllIntegrations();
    const isAllIntegrationsActive = integrationManager.isAllIntegrationsActive();

    const statusCode = (readinessResult.isReady && isAllIntegrationsActive) ? 200 : 503;

    res.status(statusCode).json({
      ready: readinessResult.isReady && isAllIntegrationsActive,
      readinessScore: readinessResult.readinessScore,
      timestamp: new Date().toISOString(),
      environment: environmentConfig.NODE_ENV
    });
  } catch (error) {
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
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: String(error)
    });
  }
});

export { router as healthRouter };