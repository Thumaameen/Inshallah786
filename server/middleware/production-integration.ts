/**
 * Production Integration Middleware
 * Optimized for Render deployment with enhanced error handling and retry logic
 */

import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from '../services/integration-service.js';
import { storage } from '../storage.js';

interface ProductionRequestState {
  startTime: number;
  retryCount: number;
  circuitBreakerStatus: 'closed' | 'open' | 'half-open';
}

export const productionIntegrationMiddleware = () => {
  const integrationService = IntegrationService.getInstance();
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  const circuitBreakerTimeout = 30000; // 30 seconds

  return async (req: Request & { state?: ProductionRequestState }, res: Response, next: NextFunction) => {
    // Initialize request state
    req.state = {
      startTime: Date.now(),
      retryCount: 0,
      circuitBreakerStatus: 'closed'
    };

    // Check circuit breaker status
    const failureCount = await storage.getFailureCount();
    if (failureCount > 10) {
      req.state.circuitBreakerStatus = 'open';
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        retryAfter: circuitBreakerTimeout / 1000
      });
    }

    // Middleware error handling wrapper
    const executeWithRetry = async () => {
      try {
        // Track request metrics
        await integrationService.trackRequest({
          path: req.path,
          method: req.method,
          timestamp: new Date()
        });

        // Execute next middleware
        await next();

        // Track successful response
        await integrationService.trackResponse({
          path: req.path,
          statusCode: res.statusCode,
          responseTime: Date.now() - req.state!.startTime
        });

      } catch (error) {
        req.state!.retryCount++;
        
        // Handle retry logic
        if (req.state!.retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry();
        }

        // Update failure metrics
        await storage.incrementFailureCount();

        // Forward to error handler
        next(error);
      }
    };

    // Start execution
    await executeWithRetry();
  };
};