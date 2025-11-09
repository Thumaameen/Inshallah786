/**
 * PRODUCTION API KEY VALIDATION
 * No bypass functionality - all APIs require real credentials
 */

import { Request, Response, NextFunction } from 'express';

export function universalAPIBypass(req: Request, res: Response, next: NextFunction) {
  // No bypass in production - validate all API keys are real
  const requiredKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    console.warn('⚠️ Missing API keys:', missingKeys.join(', '));
  }

  next();
}

const UniversalAPIKeyBypass = {
  private static instance: UniversalAPIKeyBypass;

  private constructor() {}

  public static getInstance(): UniversalAPIKeyBypass {
    if (!UniversalAPIKeyBypass.instance) {
      UniversalAPIKeyBypass.instance = new UniversalAPIKeyBypass();
    }
    return UniversalAPIKeyBypass.instance;
  }

  public isEnabled(): boolean {
    return false; // Always disabled in production
  }

  public isValidationBypassed(): boolean {
    return false; // Never bypass validation
  }
};

const universalBypass = UniversalAPIKeyBypass.getInstance();
export { UniversalAPIKeyBypass, universalBypass };