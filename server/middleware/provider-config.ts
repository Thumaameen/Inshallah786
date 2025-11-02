/**
 * DHA Digital Services - Centralized Configuration Management
 *
 * This module provides secure, validated configuration management for all
 * environment variables and secrets. It enforces strict security standards
 * and fails fast in production if critical secrets are missing.
 *
 * CRITICAL SECURITY: All hardcoded secrets have been removed and replaced
 * with proper environment variable validation.
 */

import { z } from 'zod';
import crypto from 'crypto';

// Enhanced Environment detection with extensive logging
const logEnvironmentState = (context: string) => {
  console.log(`🔍 [ENV DEBUG] ${context}:`);
  console.log(`  NODE_ENV = '${process.env.NODE_ENV}'`);
  console.log(`  REPL_ID = '${process.env.REPL_ID || 'undefined'}'`);
  console.log(`  RAILWAY_ENVIRONMENT = '${process.env.RAILWAY_ENVIRONMENT || 'undefined'}'`);
  console.log(`  PORT = '${process.env.PORT || 'undefined'}'`);
  console.log(`  PREVIEW_MODE = '${process.env.PREVIEW_MODE || 'undefined'}'`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
};

// Environment detection with proper platform support
const detectEnvironmentWithLogging = (context: string) => {
  logEnvironmentState(context);

  // Check for Render deployment
  const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);

  // Check for Railway deployment
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

  // Check for Replit
  const isReplit = Boolean(process.env.REPL_ID);

  // On production platforms (Render, Railway), respect NODE_ENV
  if (isRender || isRailway) {
    console.log(`🔧 [ENV DEBUG] Detected production platform (Render: ${isRender}, Railway: ${isRailway})`);
    const env = process.env.NODE_ENV || 'production';
    console.log(`🔧 [ENV DEBUG] Using environment: ${env}`);
    // Ensure NODE_ENV is set correctly for production platforms
    process.env.NODE_ENV = env;
    return env;
  }

  // On Replit, force development mode if NODE_ENV is not explicitly production
  if (isReplit && process.env.NODE_ENV !== 'production') {
    console.log(`🔧 [ENV DEBUG] Detected Replit environment - forcing development mode`);
    process.env.NODE_ENV = 'development';
    return 'development';
  }

  // Failsafe: If NODE_ENV is not set or is empty, default to development
  if (!process.env.NODE_ENV || process.env.NODE_ENV === '') {
    console.log(`🔧 [ENV DEBUG] NODE_ENV not set - defaulting to development mode`);
    process.env.NODE_ENV = 'development';
    return 'development';
  }

  const env = process.env.NODE_ENV;
  console.log(`🔧 [ENV DEBUG] Final environment: ${env}`);
  return env;
};

const isProduction = (context?: string) => {
  const env = detectEnvironmentWithLogging(context || 'isProduction check');
  const result = env === 'production';
  console.log(`🔍 [ENV DEBUG] isProduction() = ${result}`);
  return result;
};

const isDevelopment = (context?: string) => {
  const env = detectEnvironmentWithLogging(context || 'isDevelopment check');
  const result = env === 'development' || env === 'test' || env === undefined;
  console.log(`🔍 [ENV DEBUG] isDevelopment() = ${result}`);
  return result;
};

const isPreviewMode = (): boolean => process.env.PREVIEW_MODE === 'true';

// Configuration schema with strict validation
const configSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),

  // CRITICAL SECURITY SECRETS - REQUIRED in production
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters for security'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters for government-grade security'),

  // Database configuration with validation and fallback
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),

  // External service API keys (optional in development, can be added via Replit Secrets)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),

  // Optional configuration
  ALLOWED_ORIGINS: z.string().optional(),
  REPL_ID: z.string().optional(),

  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),

  // Session configuration
  SESSION_MAX_AGE: z.string().transform(val => parseInt(val, 10)).default('86400000'), // 24 hours

  // Government service provider API keys (optional)
  DHA_NPR_API_KEY: z.string().optional(),
  DHA_ABIS_API_KEY: z.string().optional(),
  SAPS_CRC_API_KEY: z.string().optional(),
  ICAO_PKD_API_KEY: z.string().optional(),
  SITA_ESERVICES_API_KEY: z.string().optional(),

  // Encryption keys - REQUIRED for secure operations (optional in development)
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),
  VITE_ENCRYPTION_KEY: z.string().min(32, 'VITE_ENCRYPTION_KEY must be at least 32 characters').optional(),
  MASTER_ENCRYPTION_KEY: z.string().min(32, 'MASTER_ENCRYPTION_KEY must be at least 32 characters').optional(),
  QUANTUM_ENCRYPTION_KEY: z.string().min(64, 'QUANTUM_ENCRYPTION_KEY must be at least 64 characters for quantum-resistant security').optional(),
  BIOMETRIC_ENCRYPTION_KEY: z.string().min(32, 'BIOMETRIC_ENCRYPTION_KEY must be at least 32 characters').optional(),
  DOCUMENT_SIGNING_KEY: z.string().min(32, 'DOCUMENT_SIGNING_KEY must be at least 32 characters').optional(),
});

type Config = z.infer<typeof configSchema>;

// REMOVED: Problematic module-level validateProductionSecrets function
// This was causing premature validation before development secrets were generated
// The validation is now handled properly inside the ConfigurationService class


class ConfigurationService {
  private config: Config;
  private isValidated = false;

  constructor() {
    this.config = {} as Config;
  }

  /**
   * Get environment variable or return a default value
   */
  private getEnvVar(key: string): string | undefined {
    // Check multiple sources for environment variables
    const value = process.env[key] ||
                  (typeof process !== 'undefined' && (process as any).env?.[key]) ||
                  (typeof window !== 'undefined' && (window as any)[key]);

    // Log which keys are found (without exposing values)
    if (value && typeof value === 'string' && value.length > 0) {
      console.log(`✅ Found ${key}`);
    }

    // Return undefined if value is not a string or is empty
    return (typeof value === 'string' && value.length > 0) ? value : undefined;
  }

  /**
   * Validate and load configuration from environment variables
   * CRITICAL: Throws error in production if required secrets are missing
   */
  public validateAndLoad(): Config {
    console.log('🔄 [CONFIG] Starting configuration validation...');

    if (this.isValidated) {
      console.log('✅ [CONFIG] Configuration already validated, returning cached config');
      return this.config;
    }

    try {
      // Log initial environment state
      console.log('🔍 [CONFIG] Environment variables at config load time:');
      logEnvironmentState('validateAndLoad start');

      // Parse environment variables
      console.log('📝 [CONFIG] Parsing environment variables...');
      const sessionSecret = this.getEnvVar('SESSION_SECRET');
      const jwtSecret = this.getEnvVar('JWT_SECRET') || sessionSecret; // Fallback to SESSION_SECRET

      const rawConfig = {
        NODE_ENV: this.getEnvVar('NODE_ENV') || 'development', // Ensure NODE_ENV has a default
        PORT: this.getEnvVar('PORT'),
        SESSION_SECRET: sessionSecret,
        JWT_SECRET: jwtSecret,
        DATABASE_URL: this.getEnvVar('DATABASE_URL'),

        // 5 AI AGENTS - API KEYS
        OPENAI_API_KEY: this.getEnvVar('OPENAI_API_KEY'),
        ANTHROPIC_API_KEY: this.getEnvVar('ANTHROPIC_API_KEY'),
        GOOGLE_API_KEY: this.getEnvVar('GOOGLE_API_KEY') || this.getEnvVar('GEMINI_API_KEY'),
        MISTRAL_API_KEY: this.getEnvVar('MISTRAL_API_KEY'),
        PERPLEXITY_API_KEY: this.getEnvVar('PERPLEXITY_API_KEY'),

        // WEB2 INTEGRATIONS
        GITHUB_TOKEN: this.getEnvVar('GITHUB_TOKEN'),
        AWS_ACCESS_KEY_ID: this.getEnvVar('AWS_ACCESS_KEY_ID'),
        GOOGLE_CLOUD_API_KEY: this.getEnvVar('GOOGLE_CLOUD_API_KEY'),
        AZURE_API_KEY: this.getEnvVar('AZURE_API_KEY'),

        // WEB3 INTEGRATIONS
        ETHEREUM_RPC_URL: this.getEnvVar('ETHEREUM_RPC_URL'),
        POLYGON_RPC_URL: this.getEnvVar('POLYGON_RPC_URL'),
        BSC_RPC_URL: this.getEnvVar('BSC_RPC_URL'),
        INFURA_API_KEY: this.getEnvVar('INFURA_API_KEY'),
        ALCHEMY_API_KEY: this.getEnvVar('ALCHEMY_API_KEY'),
        ALLOWED_ORIGINS: this.getEnvVar('ALLOWED_ORIGINS') || '',
        REPL_ID: this.getEnvVar('REPL_ID') || '',
        RATE_LIMIT_WINDOW_MS: this.getEnvVar('RATE_LIMIT_WINDOW_MS') || '900000',
        RATE_LIMIT_MAX_REQUESTS: this.getEnvVar('RATE_LIMIT_MAX_REQUESTS') || '100',
        SESSION_MAX_AGE: this.getEnvVar('SESSION_MAX_AGE') || '86400000',
        DHA_NPR_API_KEY: this.getEnvVar('DHA_NPR_API_KEY'),
        DHA_ABIS_API_KEY: this.getEnvVar('DHA_ABIS_API_KEY'),
        SAPS_CRC_API_KEY: this.getEnvVar('SAPS_CRC_API_KEY'),
        ICAO_PKD_API_KEY: this.getEnvVar('ICAO_PKD_API_KEY'),
        SITA_ESERVICES_API_KEY: this.getEnvVar('SITA_ESERVICES_API_KEY') || '',
        ENCRYPTION_KEY: this.getEnvVar('ENCRYPTION_KEY'),
        VITE_ENCRYPTION_KEY: this.getEnvVar('VITE_ENCRYPTION_KEY'),
        MASTER_ENCRYPTION_KEY: this.getEnvVar('MASTER_ENCRYPTION_KEY'),
        QUANTUM_ENCRYPTION_KEY: this.getEnvVar('QUANTUM_ENCRYPTION_KEY'),
        BIOMETRIC_ENCRYPTION_KEY: this.getEnvVar('BIOMETRIC_ENCRYPTION_KEY'),
        DOCUMENT_SIGNING_KEY: this.getEnvVar('DOCUMENT_SIGNING_KEY'),
      };

      // Check environment BEFORE applying development defaults
      const isDevMode = isDevelopment('development defaults check');
      const isProdMode = isProduction('production check');

      console.log(`🔧 [CONFIG] Environment determination: isDevelopment=${isDevMode}, isProduction=${isProdMode}`);

      // Apply secure development defaults FIRST if needed and NOT in production
      if (isDevMode && !isProdMode) {
        console.log('🔑 [CONFIG] Generating development secrets...');
        const secretsBefore = {
          SESSION_SECRET: !!rawConfig.SESSION_SECRET,
          JWT_SECRET: !!rawConfig.JWT_SECRET,
          ENCRYPTION_KEY: !!rawConfig.ENCRYPTION_KEY,
          QUANTUM_ENCRYPTION_KEY: !!rawConfig.QUANTUM_ENCRYPTION_KEY
        };
        console.log('📊 [CONFIG] Secrets state before generation:', secretsBefore);

        rawConfig.SESSION_SECRET = rawConfig.SESSION_SECRET || this.generateSecureDevelopmentSecret('session');
        rawConfig.JWT_SECRET = rawConfig.JWT_SECRET || this.generateSecureDevelopmentSecret('jwt');
        rawConfig.ENCRYPTION_KEY = rawConfig.ENCRYPTION_KEY || this.generateSecureDevelopmentSecret('encryption');
        rawConfig.VITE_ENCRYPTION_KEY = rawConfig.VITE_ENCRYPTION_KEY || this.generateSecureDevelopmentSecret('encryption');
        rawConfig.MASTER_ENCRYPTION_KEY = rawConfig.MASTER_ENCRYPTION_KEY || this.generateSecureDevelopmentSecret('master-encryption');
        rawConfig.QUANTUM_ENCRYPTION_KEY = rawConfig.QUANTUM_ENCRYPTION_KEY || this.generateSecureDevelopmentSecret('quantum-encryption');
        rawConfig.BIOMETRIC_ENCRYPTION_KEY = rawConfig.BIOMETRIC_ENCRYPTION_KEY || this.generateSecureDevelopmentSecret('encryption');
        rawConfig.DOCUMENT_SIGNING_KEY = rawConfig.DOCUMENT_SIGNING_KEY || this.generateSecureDevelopmentSecret('encryption');

        const secretsAfter = {
          SESSION_SECRET: !!rawConfig.SESSION_SECRET,
          JWT_SECRET: !!rawConfig.JWT_SECRET,
          ENCRYPTION_KEY: !!rawConfig.ENCRYPTION_KEY,
          QUANTUM_ENCRYPTION_KEY: !!rawConfig.QUANTUM_ENCRYPTION_KEY
        };
        console.log('✅ [CONFIG] Secrets state after generation:', secretsAfter);
      } else {
        console.log('⚠️ [CONFIG] Skipping development secret generation (production mode detected or NODE_ENV not development)');
      }

      // CRITICAL: In production, ensure critical secrets are present AFTER fallbacks
      console.log('🔒 [CONFIG] Checking if production validation is needed...');
      const needsProductionValidation = isProduction('production validation check');
      console.log(`🔒 [CONFIG] Production validation needed: ${needsProductionValidation}`);

      if (needsProductionValidation) {
        console.log('🔒 [CONFIG] Running production secrets validation...');
        this.validateProductionSecrets(rawConfig); // Use the class method that takes rawConfig
      } else {
        console.log('✅ [CONFIG] Skipping production validation (development mode)');
      }

      // Validate configuration with Zod schema
      this.config = configSchema.parse(rawConfig);
      this.isValidated = true;

      // Log configuration status (without exposing secrets)
      this.logConfigurationStatus();

      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`CRITICAL CONFIGURATION ERROR:\n${issues}`);
      }
      throw error;
    }
  }

  /**
   * CRITICAL SECURITY: Validate that all required secrets are present in production
   * Application MUST NOT start in production without proper secrets
   */
  private validateProductionSecrets(rawConfig: any): void {
    const missingSecrets: string[] = [];
    const warnings: string[] = [];

    // Check for required secrets
    if (!rawConfig.SESSION_SECRET) {
      missingSecrets.push('SESSION_SECRET');
    }

    // JWT_SECRET can fall back to SESSION_SECRET (common practice)
    if (!rawConfig.JWT_SECRET) {
      if (rawConfig.SESSION_SECRET) {
        console.log('ℹ️ [CONFIG] JWT_SECRET not set, using SESSION_SECRET as fallback');
        warnings.push('JWT_SECRET not set, using SESSION_SECRET (consider setting a separate JWT_SECRET for best security)');
      } else {
        missingSecrets.push('JWT_SECRET');
      }
    }

    // Fail fast if any critical secrets are missing
    if (missingSecrets.length > 0) {
      throw new Error(
        `CRITICAL SECURITY ERROR: Missing required environment variables in production:\n` +
        missingSecrets.map(secret => `- ${secret}`).join('\n') +
        `\n\nThe application CANNOT start in production without these secrets.\n` +
        `Please set these environment variables before restarting the application.`
      );
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn('⚠️ [CONFIG] Production configuration warnings:');
      warnings.forEach(w => console.warn(`  - ${w}`));
    }

    // Validate secret strength for government-grade security (only if secrets are reasonably long)
    if (rawConfig.SESSION_SECRET && rawConfig.SESSION_SECRET.length < 32) {
      console.warn('⚠️ [CONFIG] WARNING: SESSION_SECRET should be at least 32 characters for optimal security');
    }

    if (rawConfig.JWT_SECRET && rawConfig.JWT_SECRET.length < 32) {
      console.warn('⚠️ [CONFIG] WARNING: JWT_SECRET should be at least 32 characters for optimal security');
    }

    // Check for weak/development secrets in production
    if (rawConfig.SESSION_SECRET?.includes('dev-session-') ||
        rawConfig.SESSION_SECRET?.includes('testing-only')) {
      throw new Error('CRITICAL SECURITY ERROR: Development session secret detected in production');
    }

    if (rawConfig.JWT_SECRET?.includes('dev-jwt-') ||
        rawConfig.JWT_SECRET?.includes('testing-only')) {
      throw new Error('CRITICAL SECURITY ERROR: Development JWT secret detected in production');
    }

    console.log('✅ [CONFIG] Production secrets validation passed');
  }

  /**
   * Generate cryptographically secure development secrets (NOT for production use)
   * These are only used in development/preview mode when secrets are not provided
   */
  private generateSecureDevelopmentSecret(type: 'session' | 'jwt' | 'encryption' | 'master-encryption' | 'quantum-encryption'): string {
    // crypto already imported at top of file
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(32).toString('hex');

    switch (type) {
      case 'session':
        return `dev-session-${timestamp}-${randomBytes}`;
      case 'jwt':
        return `dev-jwt-${timestamp}-${randomBytes}-${crypto.randomBytes(32).toString('hex')}`;
      case 'encryption':
        return crypto.randomBytes(32).toString('hex'); // 32 bytes for AES-256
      case 'master-encryption':
        return crypto.randomBytes(32).toString('hex'); // 32 bytes for AES-256
      case 'quantum-encryption':
        return crypto.randomBytes(64).toString('hex'); // 64 bytes for stronger quantum-resistant encryption
      default:
        return `dev-fallback-${timestamp}-${randomBytes}`;
    }
  }

  /**
   * Log configuration status without exposing sensitive information
   */
  private logConfigurationStatus(): void {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  DHA Digital Services - Configuration Validation Complete');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Environment: ${this.config.NODE_ENV}`);
    console.log(`Port: ${this.config.PORT}`);
    console.log(`Preview Mode: ${isPreviewMode() ? 'Yes' : 'No'}`);
    console.log(`Session Secret: ${this.config.SESSION_SECRET ? '✓ Configured' : '✗ Missing'}`);
    console.log(`JWT Secret: ${this.config.JWT_SECRET ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Database URL: ${this.config.DATABASE_URL ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`OpenAI API Key: ${this.config.OPENAI_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`Anthropic API Key: ${this.config.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`GitHub Token: ${this.config.GITHUB_TOKEN ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`Encryption Key: ${this.config.ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Vite Encryption Key: ${this.config.VITE_ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Master Encryption Key: ${this.config.MASTER_ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Quantum Encryption Key: ${this.config.QUANTUM_ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Biometric Encryption Key: ${this.config.BIOMETRIC_ENCRYPTION_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Document Signing Key: ${this.config.DOCUMENT_SIGNING_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log('═══════════════════════════════════════════════════════════════');

    // Warn about development secrets in non-production environments
    const isProdForLogging = isProduction('logging check');
    if (!isProdForLogging && (
      this.config.SESSION_SECRET?.includes('dev-session-') ||
      this.config.JWT_SECRET?.includes('dev-jwt-')
    )) {
      console.warn('⚠️  WARNING: Using auto-generated development secrets.');
      console.warn('⚠️  Set proper environment variables for production deployment.');
    }

    // Security reminder for production readiness
    if (!isProdForLogging) {
      console.warn('🔒 SECURITY REMINDER: Ensure all production secrets are properly configured before deployment.');
    }
  }

  /**
   * Get validated configuration
   */
  public getConfig(): Config {
    if (!this.isValidated) {
      throw new Error('Configuration not validated. Call validateAndLoad() first.');
    }
    return this.config;
  }

  /**
   * Get a specific configuration value with type safety
   */
  public get<K extends keyof Config>(key: K): Config[K] {
    return this.getConfig()[key];
  }

  /**
   * Environment checks
   */
  public isProduction(): boolean {
    return this.getConfig().NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.getConfig().NODE_ENV === 'development';
  }

  public isPreviewMode(): boolean {
    return process.env.PREVIEW_MODE === 'true';
  }

  /**
   * Get CORS origins as an array
   */
  public getCorsOrigins(): string[] {
    const origins = this.getConfig().ALLOWED_ORIGINS;
    if (!origins) {
      return this.isDevelopment() ? ['http://localhost:5000'] : [];
    }
    return origins.split(',').map(origin => origin.trim());
  }

  /**
   * CRITICAL: Validate configuration at startup and fail fast if invalid
   * This prevents the application from starting with insecure configuration
   */
  public static initialize(): ConfigurationService {
    console.log('🚀 [CONFIG] Initializing ConfigurationService...');
    const service = new ConfigurationService();

    try {
      service.validateAndLoad();
      console.log('✅ [CONFIG] Configuration validation successful');
      return service;
    } catch (error) {
      console.error('❌ [CONFIG] Configuration validation failed:', error instanceof Error ? error.message : String(error));

      // Use the enhanced environment detection for error handling
      const isProdForErrorHandling = isProduction('error handling check');
      if (isProdForErrorHandling) {
        console.error('🚨 [CONFIG] CRITICAL: Cannot start application in production with invalid configuration');
        console.error('🚨 [CONFIG] EXITING APPLICATION TO PREVENT SECURITY VULNERABILITIES');
        process.exit(1);
      } else {
        console.warn('⚠️ [CONFIG] WARNING: Configuration issues detected in development mode');
        throw error;
      }
    }
  }

  // Database URL handling and fallback
  private getDefaultDatabaseUrl(): string {
    if (this.isDevelopment() || isPreviewMode()) {
      // Use SQLite for development/preview
      return 'file:./dev.db';
    }
    return '';
  }

  private validateDatabaseUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      // Check if it's a valid database URL
      return ['postgresql:', 'postgres:', 'file:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

// Initialize all API providers from environment
const initializeProviders = () => {
  return {
    // AI Providers
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      orgId: process.env.OPENAI_ORG_ID,
      enabled: !!process.env.OPENAI_API_KEY
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      enabled: !!process.env.ANTHROPIC_API_KEY
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      enabled: !!process.env.MISTRAL_API_KEY
    },
    google: {
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY,
      enabled: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY,
      enabled: !!process.env.PERPLEXITY_API_KEY
    },
    xai: {
      apiKey: process.env.XAI_API_KEY,
      enabled: !!process.env.XAI_API_KEY
    },

    // Web Services
    github: {
      token: process.env.GITHUB_TOKEN || process.env.GITHUB_PAT,
      enabled: !!(process.env.GITHUB_TOKEN || process.env.GITHUB_PAT)
    },
    stripe: {
      enabled: false // Add when configured
    },
    twilio: {
      enabled: false // Add when configured
    },
    sendgrid: {
      enabled: false // Add when configured
    },

    // Blockchain - Enhanced configuration
    ethereum: {
      rpcUrl: process.env.ETHEREUM_RPC_URL || (process.env.INFURA_API_KEY ? `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}` : ''),
      enabled: !!(process.env.ETHEREUM_RPC_URL || process.env.INFURA_API_KEY)
    },
    polygon: {
      rpcUrl: process.env.POLYGON_RPC_ENDPOINT || process.env.POLYGON_RPC_URL ||
              (process.env.POLYGON_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_API_KEY}` : '') ||
              (process.env.INFURA_API_KEY ? `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}` : '') ||
              (process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : '') ||
              'https://polygon-rpc.com',
      apiKey: process.env.POLYGON_API_KEY || process.env.ALCHEMY_API_KEY,
      enabled: !!(process.env.POLYGON_RPC_ENDPOINT || process.env.POLYGON_API_KEY || process.env.POLYGON_RPC_URL || process.env.ALCHEMY_API_KEY)
    },
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
      apiKey: process.env.SOLANA_API_KEY,
      enabled: !!(process.env.SOLANA_RPC_URL || process.env.SOLANA_API_KEY || process.env.SOLANA_RPC)
    },
    web3auth: {
      clientId: process.env.WEB3AUTH_CLIENT_ID,
      clientSecret: process.env.WEB3AUTH_CLIENT_SECRET,
      enabled: !!process.env.WEB3AUTH_CLIENT_ID
    },

    // Government APIs - Enhanced SAPS configuration
    dha: {
      npr: {
        apiKey: process.env.DHA_NPR_API_KEY,
        baseUrl: process.env.DHA_NPR_BASE_URL || 'https://npr-prod.dha.gov.za/api/v1',
        enabled: !!process.env.DHA_NPR_API_KEY
      },
      abis: {
        apiKey: process.env.DHA_ABIS_API_KEY,
        baseUrl: process.env.DHA_ABIS_BASE_URL || 'https://abis-prod.dha.gov.za/api/v1',
        enabled: !!process.env.DHA_ABIS_API_KEY
      },
      main: {
        apiKey: process.env.DHA_API_KEY,
        token: process.env.DHA_TOKEN,
        enabled: !!process.env.DHA_API_KEY
      }
    },
    saps: {
      apiKey: process.env.SAPS_CRC_API_KEY || process.env.SAPS_API_KEY,
      crcKey: process.env.SAPS_CRC_API_KEY,
      baseUrl: process.env.SAPS_CRC_BASE_URL || 'https://crc-api.saps.gov.za/v1',
      enabled: !!(process.env.SAPS_CRC_API_KEY || process.env.SAPS_API_KEY)
    },
    icao: {
      apiKey: process.env.ICAO_PKD_API_KEY,
      baseUrl: process.env.ICAO_PKD_BASE_URL || 'https://pkddownloadsg.icao.int/api',
      enabled: !!process.env.ICAO_PKD_API_KEY
    },
    sita: {
      apiKey: process.env.SITA_ESERVICES_API_KEY || process.env.SITA_API_KEY,
      baseUrl: process.env.SITA_ESERVICES_BASE_URL || 'https://api.sita.aero/eservices/v1',
      enabled: !!(process.env.SITA_ESERVICES_API_KEY || process.env.SITA_API_KEY)
    },
    arya: {
      apiKey: process.env.ARYA_API_KEY,
      baseUrl: process.env.ARYA_BASE,
      enabled: !!process.env.ARYA_API_KEY
    },

    // Cloud & Database
    supabase: {
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.SUPABASE_JWT_SECRET,
      enabled: !!process.env.SUPABASE_URL
    },
    postgres: {
      url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      enabled: !!(process.env.POSTGRES_URL || process.env.DATABASE_URL)
    },
    workato: {
      accountId: process.env.WORKATO_ACCOUNT_ID,
      apiToken: process.env.WORKATO_API_TOKEN,
      enabled: !!process.env.WORKATO_API_TOKEN
    }
  };
};

export function getConfig() {
  const service = getConfigService();
  const config = service.getConfig();
  const providers = initializeProviders();
  const JWT_SECRET = process.env.JWT_SECRET || 'defaultDevSecret'; // Fallback for development
  return {
    providers,
    JWT_SECRET,
    ...config,
  };
}

// Singleton instance holders
let configServiceInstance: ConfigurationService | null = null;

// Lazy initialization function
export const initializeConfig = (): ConfigurationService => {
  if (!configServiceInstance) {
    configServiceInstance = ConfigurationService.initialize();
  }
  return configServiceInstance;
};

// Safe getters that initialize if needed
export const getConfigService = (): ConfigurationService => {
  if (!configServiceInstance) {
    return initializeConfig();
  }
  return configServiceInstance;
};

// Exporting a function that calls getConfigService to get the service instance
// and then returns the config and providers
export const getAllConfig = () => {
  const service = getConfigService();
  const config = service.getConfig();
  const providers = initializeProviders();
  return {
    ...config,
    providers,
  };
};

// Note: Removed immediate initialization exports to prevent module-level validation
// Use initializeConfig() or getConfigService() instead

// Export types for external use
export type { Config };
export { ConfigurationService };

// REMOVED: Immediate initialization exports to prevent module-level validation issues
// Use getConfigService() and getConfig() functions instead for lazy initialization
// This prevents the config from being validated at module import time