
/**
 * PRODUCTION API KEY VALIDATION
 * No bypass functionality
 */

import { Request, Response, NextFunction } from 'express';

interface APIKeyConfig {
  openai?: string;
  anthropic?: string;
  google?: string;
  apiBypassEnabled: boolean;
}

class UniversalAPIKeyBypass {
  private static instance: UniversalAPIKeyBypass;
  private config: APIKeyConfig;

  private constructor() {
    this.config = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || '',
      apiBypassEnabled: false // Always false in production
    };
  }

  public static getInstance(): UniversalAPIKeyBypass {
    if (!UniversalAPIKeyBypass.instance) {
      UniversalAPIKeyBypass.instance = new UniversalAPIKeyBypass();
    }
    return UniversalAPIKeyBypass.instance;
  }

  public getAPIKey(service: string): string {
    const key = this.config[service as keyof APIKeyConfig];
    if (!key || typeof key !== 'string') {
      throw new Error(`API key for ${service} not configured`);
    }
    return key;
  }

  public isEnabled(): boolean {
    return false; // Never enabled in production
  }

  // Production mode - no bypasses allowed
  bypassMissingAPIKeys(): void {
    const apiKeys = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GOOGLE_API_KEY',
      'DHA_NPR_API_KEY',
      'SAPS_CRC_API_KEY',
      'ICAO_PKD_API_KEY'
    ];

    apiKeys.forEach(key => {
      if (!process.env[key]) {
        console.warn(`⚠️ ${key} not configured - some features may be limited`);
      } else {
        console.log(`✅ ${key} configured`);
      }
    });
  }
}

const universalBypass = UniversalAPIKeyBypass.getInstance();

export function enhancedUniversalBypass(req: Request, res: Response, next: NextFunction): void {
  // No bypass in production
  next();
}

export { UniversalAPIKeyBypass, universalBypass };
