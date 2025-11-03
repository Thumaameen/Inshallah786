/**
 * Enhanced Production Environment Validator for Render
 */
import { logger } from '../utils/logger';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  message: string;
}

export class ProductionValidator {
  private static instance: ProductionValidator;
  private requiredEnvVars: string[];
  private optionalEnvVars: string[];

  private constructor() {
    this.requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'SESSION_SECRET',
      'JWT_SECRET',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'DHA_NPR_API_KEY',
      'DHA_ABIS_API_KEY',
      'ENCRYPTION_KEY'
    ];

    this.optionalEnvVars = [
      'SAPS_CRC_API_KEY',
      'GEMINI_API_KEY',
      'MILITARY_SERVICE_KEY',
      'BLOCKCHAIN_SERVICE_KEY'
    ];
  }

  static getInstance(): ProductionValidator {
    if (!ProductionValidator.instance) {
      ProductionValidator.instance = new ProductionValidator();
    }
    return ProductionValidator.instance;
  }

  validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    }

    // Check optional environment variables
    for (const envVar of this.optionalEnvVars) {
      if (!process.env[envVar]) {
        warnings.push(`Optional environment variable not configured: ${envVar}`);
      }
    }

    // Verify Render-specific configuration
    if (process.env.RENDER === 'true') {
      if (!process.env.RENDER_EXTERNAL_URL) {
        warnings.push('RENDER_EXTERNAL_URL not configured');
      }
    }

    // Validate port configuration
    const port = process.env.PORT;
    if (port && (isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535)) {
      errors.push('Invalid PORT configuration');
    }

    // Check database URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
      errors.push('Invalid DATABASE_URL format');
    }

    const isValid = errors.length === 0;
    const message = isValid 
      ? 'Production environment validation passed'
      : 'Production environment validation failed';

    logger.info(`Production validation complete - ${message}`);
    
    return {
      isValid,
      errors,
      warnings,
      message
    };
  }

  validateSecurityConfiguration(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verify encryption keys
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
      errors.push('Invalid ENCRYPTION_KEY configuration');
    }

    // Verify JWT configuration
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('Invalid JWT_SECRET configuration');
    }

    // Check HTTPS configuration on Render
    if (process.env.RENDER === 'true' && process.env.RENDER_EXTERNAL_URL) {
      if (!process.env.RENDER_EXTERNAL_URL.startsWith('https://')) {
        errors.push('Render deployment must use HTTPS');
      }
    }

    const isValid = errors.length === 0;
    const message = isValid 
      ? 'Security configuration validation passed'
      : 'Security configuration validation failed';

    logger.info(`Security validation complete - ${message}`);

    return {
      isValid,
      errors,
      warnings,
      message
    };
  }
}

export const productionValidator = ProductionValidator.getInstance();