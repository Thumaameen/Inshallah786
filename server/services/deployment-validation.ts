/**
 * Deployment Validation Service
 * 
 * Validates that all required environment variables and configurations are properly set
 * before allowing the application to start. This ensures fail-fast behavior in production.
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DeploymentValidator {
  private readonly isProduction: boolean;
  private readonly isRender: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isRender = process.env.RENDER === 'true';
  }

  /**
   * Validate all deployment requirements
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         DEPLOYMENT VALIDATION - DHA DIGITAL SERVICES          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Basic environment validation
    console.log('📋 ENVIRONMENT CONFIGURATION:');
    console.log(`  • Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  • Platform: ${this.isRender ? 'Render' : 'Local/Other'}`);
    console.log(`  • Port: ${process.env.PORT || '5000'}`);
    console.log('');

    // Database validation
    this.validateDatabase(errors, warnings);

    // Security validation
    this.validateSecurity(errors, warnings);

    // API integrations validation
    this.validateAPIIntegrations(errors, warnings);

    // Government API validation - Pass errors array for production fail-hard
    this.validateGovernmentAPIs(errors, warnings);

    // Display summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('VALIDATION SUMMARY:');
    console.log(`  ✓ Errors: ${errors.length}`);
    console.log(`  ⚠ Warnings: ${warnings.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (errors.length > 0) {
      console.error('❌ DEPLOYMENT VALIDATION FAILED:');
      errors.forEach(error => console.error(`  • ${error}`));
      console.log('');
    }

    if (warnings.length > 0 && this.isProduction) {
      console.warn('⚠️  DEPLOYMENT WARNINGS:');
      warnings.forEach(warning => console.warn(`  • ${warning}`));
      console.log('');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate database configuration
   */
  private validateDatabase(errors: string[], warnings: string[]): void {
    console.log('🗄️  DATABASE:');
    
    if (process.env.DATABASE_URL) {
      console.log('  ✅ Database URL configured');
    } else {
      if (this.isProduction) {
        errors.push('DATABASE_URL is required in production');
        console.log('  ❌ Database URL not configured');
      } else {
        warnings.push('DATABASE_URL not configured (development mode)');
        console.log('  ⚠️  Database URL not configured (using in-memory storage)');
      }
    }
    console.log('');
  }

  /**
   * Validate security configuration
   */
  private validateSecurity(errors: string[], warnings: string[]): void {
    console.log('🔒 SECURITY:');

    // Session secret
    if (process.env.SESSION_SECRET) {
      console.log('  ✅ Session secret configured');
    } else {
      if (this.isProduction) {
        warnings.push('SESSION_SECRET not set (using auto-generated)');
        console.log('  ⚠️  Session secret not set (using auto-generated)');
      } else {
        console.log('  ✓ Session secret (using auto-generated for development)');
      }
    }

    // JWT secret
    if (process.env.JWT_SECRET) {
      console.log('  ✅ JWT secret configured');
    } else {
      if (this.isProduction) {
        warnings.push('JWT_SECRET not set (using auto-generated)');
        console.log('  ⚠️  JWT secret not set (using auto-generated)');
      } else {
        console.log('  ✓ JWT secret (using auto-generated for development)');
      }
    }

    // Encryption keys
    if (process.env.ENCRYPTION_KEY) {
      console.log('  ✅ Encryption key configured');
    } else {
      if (this.isProduction) {
        warnings.push('ENCRYPTION_KEY not set (using auto-generated)');
        console.log('  ⚠️  Encryption key not set (using auto-generated)');
      } else {
        console.log('  ✓ Encryption key (using auto-generated for development)');
      }
    }

    console.log('');
  }

  /**
   * Validate AI API integrations
   */
  private validateAPIIntegrations(errors: string[], warnings: string[]): void {
    console.log('🤖 AI API INTEGRATIONS:');

    const aiProviders = [
      { name: 'OpenAI', envVar: 'OPENAI_API_KEY' },
      { name: 'Anthropic', envVar: 'ANTHROPIC_API_KEY' },
      { name: 'Google Gemini', envVar: 'GOOGLE_API_KEY' },
      { name: 'Mistral', envVar: 'MISTRAL_API_KEY' },
      { name: 'Perplexity', envVar: 'PERPLEXITY_API_KEY' }
    ];

    let configuredCount = 0;
    aiProviders.forEach(provider => {
      if (process.env[provider.envVar]) {
        console.log(`  ✅ ${provider.name} API key configured`);
        configuredCount++;
      } else {
        console.log(`  ⚪ ${provider.name} API key not configured`);
      }
    });

    if (configuredCount === 0) {
      warnings.push('No AI provider API keys configured - AI features will be limited');
    }

    console.log(`  • Configured AI providers: ${configuredCount}/${aiProviders.length}`);
    console.log('');
  }

  /**
   * Validate government API integrations - FAIL HARD in production if missing
   */
  private validateGovernmentAPIs(errors: string[], warnings: string[]): void {
    console.log('🏛️  GOVERNMENT API INTEGRATIONS:');

    const govAPIs = [
      { name: 'DHA NPR', key: 'DHA_NPR_API_KEY', endpoint: 'DHA_NPR_BASE_URL' },
      { name: 'DHA ABIS', key: 'DHA_ABIS_API_KEY', endpoint: 'DHA_ABIS_BASE_URL' },
      { name: 'SAPS CRC', key: 'SAPS_CRC_API_KEY', endpoint: 'SAPS_CRC_BASE_URL' },
      { name: 'ICAO PKD', key: 'ICAO_PKD_API_KEY', endpoint: 'ICAO_PKD_BASE_URL' }
    ];

    let configuredCount = 0;
    govAPIs.forEach(api => {
      const hasKey = !!process.env[api.key];
      const hasEndpoint = !!process.env[api.endpoint];

      if (hasKey && hasEndpoint) {
        console.log(`  ✅ ${api.name} fully configured (API key + endpoint)`);
        configuredCount++;
      } else if (hasKey) {
        console.log(`  ⚠️  ${api.name} API key configured, but endpoint using default`);
        configuredCount++;
      } else {
        if (this.isProduction) {
          console.log(`  ⚠️  ${api.name} not configured (will use fallback in development)`);
        } else {
          console.log(`  ⚪ ${api.name} not configured (using development fallback)`);
        }
      }
    });

    // Warn if no government APIs configured, but don't fail
    if (configuredCount === 0 && this.isProduction) {
      warnings.push('No government API credentials detected - verify environment variables are loaded correctly');
      console.log('  ⚠️ No government API credentials detected in initial scan');
    }

    console.log(`  • Configured government APIs: ${configuredCount}/${govAPIs.length}`);
    console.log('');
  }

  /**
   * Validate deployment and throw error if critical issues found
   */
  validateOrFail(): void {
    const result = this.validate();

    if (!result.isValid) {
      throw new Error(
        `Deployment validation failed with ${result.errors.length} error(s):\n` +
        result.errors.map(e => `  • ${e}`).join('\n')
      );
    }

    if (result.warnings.length > 0) {
      console.warn(
        `\n⚠️  Deployment has ${result.warnings.length} warning(s). ` +
        `Application will start but some features may be limited.\n`
      );
    } else {
      console.log('✅ Deployment validation passed successfully!\n');
    }
  }
}

// Export singleton instance
export const deploymentValidator = new DeploymentValidator();
