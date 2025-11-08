/**
 * Environment Configuration for DHA Digital Services Platform
 * @packageDocumentation
 */

import { config } from 'dotenv';
import { join } from 'path';

// Define process.env types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      NODE_VERSION?: string;
      OPENAI_API_KEY?: string;
      ANTHROPIC_API_KEY?: string;
      GOOGLE_API_KEY?: string;
      DHA_ABIS_API_KEY?: string;
      SAPS_API_KEY?: string;
      DHA_API_KEY?: string;
      DHA_NPR_API_KEY?: string;
      ICAO_PKD_KEY?: string;
      START_TIME?: string;
    }
  }
}

// Environment configuration types
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  START_TIME?: number;
  SYSTEM?: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  apiKeys: {
    OPENAI?: string;
    ANTHROPIC?: string;
    GOOGLE?: string;
    ABIS?: string;
    SAPS?: string;
    DHA?: string;
    NPR?: string;
    ICAO?: string;
  };
  environment: {
    nodeVersion: string;
  };
}

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  try {
    config({ path: join(process.cwd(), '.env') });
  } catch (error) {
    console.warn('Warning: .env file not found, using default environment');
  }
}

// Type definitions for environment configuration
interface EnvironmentConfig {
  [x: string]: any;
  NODE_ENV: 'development' | 'production' | 'test';
  START_TIME?: number;
  SYSTEM?: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  apiKeys: {
    OPENAI?: string;
    ANTHROPIC?: string;
    GOOGLE?: string;
    ABIS?: string;
    SAPS?: string;
    DHA?: string;
    NPR?: string;
    ICAO?: string;
  };
  environment: {
    nodeVersion: string;
  };
}

// Initialize environment configuration
export const environment: EnvironmentConfig = {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'production',
  START_TIME: process.env.START_TIME ? Number(process.env.START_TIME) : Date.now(),
  SYSTEM: {
    nodeVersion: process.env.NODE_VERSION || process.version || 'unknown',
    platform: process.platform || 'unknown',
    arch: process.arch || 'unknown'
  },
  apiKeys: {
    OPENAI: process.env.OPENAI_API_KEY || '',
    ANTHROPIC: process.env.ANTHROPIC_API_KEY || '',
    GOOGLE: process.env.GOOGLE_API_KEY || '',
    ABIS: process.env.DHA_ABIS_API_KEY || '',
    SAPS: process.env.SAPS_API_KEY || '',
    DHA: process.env.DHA_API_KEY || '',
    NPR: process.env.DHA_NPR_API_KEY || '',
    ICAO: process.env.ICAO_PKD_KEY || ''
  },
  environment: {
    nodeVersion: process.env.NODE_VERSION || process.version || '20.19.1'
  }
};

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Add CommonJS default export for compatibility
export default environment;

// Legacy exports for backward compatibility
export const ENV_CONFIG = environment;
export const env = environment;
export const environmentConfig = environment;
export { environment as config };