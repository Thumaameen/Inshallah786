import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  });
};

export { rateLimit };