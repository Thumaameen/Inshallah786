import { Request, Response } from 'express';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Basic health status
    const health = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'healthy',
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      services: {
        api: true,
        database: true,
        authentication: true,
        fileStorage: true,
        ai: true
      }
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};