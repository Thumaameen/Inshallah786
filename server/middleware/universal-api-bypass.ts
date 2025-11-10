
/**
 * Universal API Bypass Middleware
 * Provides global access to all API endpoints
 */

import { Request, Response, NextFunction } from 'express';

export const universalApiBypass = (req: Request, res: Response, next: NextFunction) => {
  // Global access - no restrictions
  next();
};

export const globalAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set global access headers
  res.setHeader('X-Global-Access', 'enabled');
  res.setHeader('X-API-Access-Level', 'unrestricted');
  
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  next();
};

export const apiAccessConfig = {
  globalAccess: true,
  bypassAuth: true,
  allowAllOrigins: true,
  unrestricted: true
};

export const configureGlobalAccess = () => {
  return {
    enabled: true,
    level: 'unrestricted',
    origins: ['*'],
    methods: ['*']
  };
};

export default universalApiBypass;
