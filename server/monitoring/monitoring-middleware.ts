import { Request, Response, NextFunction } from 'express';
import { monitoringService } from './monitoring-service';

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Track response
  res.on('finish', () => {
    monitoringService.trackRequest(req.path, startTime, res.statusCode);
  });

  next();
};