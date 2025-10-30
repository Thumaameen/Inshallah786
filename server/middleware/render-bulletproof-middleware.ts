import { Request, Response, NextFunction } from 'express';

/**
 * PRODUCTION MIDDLEWARE
 * Real error handling without overrides or bypasses
 */

// Universal API Override for all missing keys
export function universalAPIOverrideMiddleware(req: Request, res: Response, next: NextFunction) {
  // No overrides in production
  next();
}

// Self-healing error handler
export function selfHealingErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('❌ Production error:', err.message);

  // Log error properly
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
}

// Circuit breaker
export function circuitBreakerMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}

// Health check optimization for free tier
export function healthCheckOptimization(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/health') {
    // Lightweight health check for free tier
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed
    });
  }
  next();
}

// Request timeout protection
export function timeoutProtection(req: Request, res: Response, next: NextFunction) {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: 'Request timeout'
      });
    }
  }, 25000); // 25 seconds (before Render's 30s limit)

  res.on('finish', () => clearTimeout(timeout));
  next();
}

// Memory optimization
export function memoryOptimization(req: Request, res: Response, next: NextFunction) {
  // Trigger GC periodically if available
  if (global.gc && Math.random() < 0.1) {
    global.gc();
  }

  // Clear large response bodies
  res.on('finish', () => {
    if (res.locals) {
      res.locals = {};
    }
  });

  next();
}