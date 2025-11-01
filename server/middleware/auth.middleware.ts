import { NextFunction, Request, Response } from 'express';
import { apiConfig } from '../../config/production-api.config';
import jwt from 'jsonwebtoken';

export const authMiddleware = {
  validateApiKey: (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== apiConfig.security.jwt) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
  },

  validateJWT: (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, apiConfig.security.jwt);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  },

  validateGovernmentAccess: (req: Request, res: Response, next: NextFunction) => {
    if (!apiConfig.features.governmentIntegration) {
      return res.status(403).json({ error: 'Government integration not enabled' });
    }
    next();
  },

  validateClassifiedAccess: (req: Request, res: Response, next: NextFunction) => {
    if (!apiConfig.features.classifiedDocs) {
      return res.status(403).json({ error: 'Classified document access not enabled' });
    }
    next();
  },

  validateGlobalAccess: (req: Request, res: Response, next: NextFunction) => {
    if (!apiConfig.features.globalAccess) {
      return res.status(403).json({ error: 'Global access not enabled' });
    }
    next();
  },

  validateMilitaryAccess: (req: Request, res: Response, next: NextFunction) => {
    if (!apiConfig.features.militaryIntegration) {
      return res.status(403).json({ error: 'Military integration not enabled' });
    }
    next();
  }
};