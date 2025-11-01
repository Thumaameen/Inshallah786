
/**
 * Render API Key Validator
 * Validates all API keys are properly loaded from Render environment
 */

interface APIKeyStatus {
  name: string;
  configured: boolean;
  length: number;
  valid: boolean;
}

export class RenderAPIValidator {
  private static instance: RenderAPIValidator;

  private constructor() {}

  static getInstance(): RenderAPIValidator {
    if (!RenderAPIValidator.instance) {
      RenderAPIValidator.instance = new RenderAPIValidator();
    }
    return RenderAPIValidator.instance;
  }

  /**
   * Validate all API keys from environment
   */
  validateAllKeys(): { valid: boolean; keys: APIKeyStatus[]; summary: string } {
    const keys: APIKeyStatus[] = [
      // AI Providers
      this.checkKey('OPENAI_API_KEY', 'sk-'),
      this.checkKey('ANTHROPIC_API_KEY', 'sk-ant-'),
      this.checkKey('MISTRAL_API_KEY'),
      this.checkKey('GOOGLE_AI_API_KEY'),
      this.checkKey('GOOGLE_API_KEY'),
      this.checkKey('GEMINI_API_KEY'),
      this.checkKey('PERPLEXITY_API_KEY'),
      this.checkKey('XAI_API_KEY'),
      
      // Government APIs
      this.checkKey('DHA_NPR_API_KEY'),
      this.checkKey('DHA_ABIS_API_KEY'),
      this.checkKey('SAPS_CRC_API_KEY'),
      this.checkKey('ICAO_PKD_API_KEY'),
      this.checkKey('DHA_API_KEY'),
      this.checkKey('DHA_TOKEN'),
      
      // Blockchain
      this.checkKey('ETHEREUM_RPC_URL', 'http'),
      this.checkKey('POLYGON_RPC_ENDPOINT', 'http'),
      this.checkKey('SOLANA_RPC_URL', 'http'),
      
      // External Services
      this.checkKey('GITHUB_TOKEN'),
      this.checkKey('STRIPE_SECRET_KEY', 'sk_'),
      this.checkKey('TWILIO_AUTH_TOKEN'),
      this.checkKey('SENDGRID_API_KEY', 'SG.'),
      
      // Database
      this.checkKey('DATABASE_URL', 'postgres'),
      
      // Security
      this.checkKey('SESSION_SECRET'),
      this.checkKey('JWT_SECRET'),
      this.checkKey('ENCRYPTION_KEY'),
    ];

    const configuredKeys = keys.filter(k => k.configured);
    const validKeys = keys.filter(k => k.valid);

    const summary = `
╔═══════════════════════════════════════════════════════════════╗
║           RENDER API KEY VALIDATION REPORT                   ║
╚═══════════════════════════════════════════════════════════════╝

📊 SUMMARY:
  • Total Keys: ${keys.length}
  • Configured: ${configuredKeys.length}
  • Valid Format: ${validKeys.length}
  • Missing: ${keys.length - configuredKeys.length}

🤖 AI PROVIDERS:
  ${this.formatKeyStatus('OPENAI_API_KEY', keys)}
  ${this.formatKeyStatus('ANTHROPIC_API_KEY', keys)}
  ${this.formatKeyStatus('MISTRAL_API_KEY', keys)}
  ${this.formatKeyStatus('GOOGLE_AI_API_KEY', keys)}
  ${this.formatKeyStatus('PERPLEXITY_API_KEY', keys)}

🏛️  GOVERNMENT APIS:
  ${this.formatKeyStatus('DHA_NPR_API_KEY', keys)}
  ${this.formatKeyStatus('DHA_ABIS_API_KEY', keys)}
  ${this.formatKeyStatus('SAPS_CRC_API_KEY', keys)}
  ${this.formatKeyStatus('ICAO_PKD_API_KEY', keys)}

⛓️  BLOCKCHAIN:
  ${this.formatKeyStatus('ETHEREUM_RPC_URL', keys)}
  ${this.formatKeyStatus('POLYGON_RPC_ENDPOINT', keys)}

🌐 EXTERNAL SERVICES:
  ${this.formatKeyStatus('GITHUB_TOKEN', keys)}
  ${this.formatKeyStatus('STRIPE_SECRET_KEY', keys)}

🗄️  DATABASE:
  ${this.formatKeyStatus('DATABASE_URL', keys)}

🔒 SECURITY:
  ${this.formatKeyStatus('SESSION_SECRET', keys)}
  ${this.formatKeyStatus('JWT_SECRET', keys)}
  ${this.formatKeyStatus('ENCRYPTION_KEY', keys)}

═══════════════════════════════════════════════════════════════
    `.trim();

    return {
      valid: validKeys.length >= 10, // At least 10 critical keys
      keys,
      summary
    };
  }

  private checkKey(name: string, prefix?: string): APIKeyStatus {
    const value = process.env[name];
    const configured = !!value;
    const length = value?.length || 0;
    let valid = configured && length > 10;

    if (prefix && configured) {
      valid = valid && value.startsWith(prefix);
    }

    return { name, configured, length, valid };
  }

  private formatKeyStatus(name: string, keys: APIKeyStatus[]): string {
    const key = keys.find(k => k.name === name);
    if (!key) return `  ${name}: ❌ Not found`;
    
    const status = key.valid ? '✅' : (key.configured ? '⚠️' : '❌');
    const detail = key.configured ? `(${key.length} chars)` : 'Missing';
    return `  ${status} ${name}: ${detail}`;
  }

  /**
   * Print validation report to console
   */
  printReport(): void {
    const result = this.validateAllKeys();
    console.log(result.summary);
    
    if (!result.valid) {
      console.log('\n⚠️  WARNING: Some critical API keys are missing or invalid!');
    } else {
      console.log('\n✅ All critical API keys validated successfully!');
    }
  }
}

export const renderAPIValidator = RenderAPIValidator.getInstance();
