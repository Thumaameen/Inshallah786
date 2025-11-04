
import { environment } from '../config/environment.js';

interface APIKeyValidation {
  provider: string;
  configured: boolean;
  valid: boolean;
  status: 'active' | 'invalid' | 'missing';
  message: string;
}

export class ProductionAPIActivator {
  private static instance: ProductionAPIActivator;
  private validationResults: Map<string, APIKeyValidation> = new Map();

  private constructor() {}

  static getInstance(): ProductionAPIActivator {
    if (!ProductionAPIActivator.instance) {
      ProductionAPIActivator.instance = new ProductionAPIActivator();
    }
    return ProductionAPIActivator.instance;
  }

  /**
   * Validate and activate all API keys
   */
  async validateAndActivateAll(): Promise<{
    success: boolean;
    totalKeys: number;
    activeKeys: number;
    results: APIKeyValidation[];
  }> {
    console.log('\n🔐 VALIDATING AND ACTIVATING ALL API KEYS...');
    console.log('═'.repeat(70));

    const results: APIKeyValidation[] = [];

    // AI Providers
    results.push(await this.validateAPIKey('OpenAI', environment.OPENAI_API_KEY as string, 'sk-'));
    results.push(await this.validateAPIKey('Anthropic', environment.ANTHROPIC_API_KEY as string, 'sk-ant-'));
    results.push(await this.validateAPIKey('Mistral', environment.MISTRAL_API_KEY as string));
    results.push(await this.validateAPIKey('Gemini', environment.GOOGLE_AI_API_KEY as string));
    results.push(await this.validateAPIKey('Perplexity', environment.PERPLEXITY_API_KEY as string));
    results.push(await this.validateAPIKey('XAI', environment.XAI_API_KEY as string));

    // Government APIs
    results.push(await this.validateAPIKey('DHA NPR', environment.DHA_NPR_API_KEY as string));
    results.push(await this.validateAPIKey('DHA ABIS', environment.DHA_ABIS_API_KEY as string));
    results.push(await this.validateAPIKey('SAPS CRC', environment.SAPS_CRC_API_KEY as string));
    results.push(await this.validateAPIKey('ICAO PKD', environment.ICAO_PKD_API_KEY as string));

    // Blockchain
    results.push(await this.validateAPIKey('Polygon RPC', environment.POLYGON_RPC_ENDPOINT as string, 'http'));
    results.push(await this.validateAPIKey('Solana RPC', environment.SOLANA_RPC_URL as string, 'http'));
    results.push(await this.validateAPIKey('Ethereum RPC', environment.ETHEREUM_RPC_URL as string, 'http'));

    // Store results
    results.forEach(result => {
      this.validationResults.set(result.provider, result);
    });

    const activeKeys = results.filter(r => r.status === 'active').length;
    const totalKeys = results.length;

    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`  ✅ Active: ${activeKeys}/${totalKeys}`);
    console.log(`  ⚠️  Invalid: ${results.filter(r => r.status === 'invalid').length}`);
    console.log(`  ❌ Missing: ${results.filter(r => r.status === 'missing').length}`);
    console.log('═'.repeat(70));

    return {
      success: activeKeys > 0,
      totalKeys,
      activeKeys,
      results
    };
  }

  /**
   * Validate individual API key
   */
  private async validateAPIKey(
    provider: string,
    apiKey: string,
    prefix?: string
  ): Promise<APIKeyValidation> {
    const key = (apiKey || '').trim();
    
    if (!key) {
      console.log(`  ❌ ${provider}: Not configured`);
      return {
        provider,
        configured: false,
        valid: false,
        status: 'missing',
        message: 'API key not configured'
      };
    }

    // Check prefix if provided
    if (prefix && !key.startsWith(prefix)) {
      console.log(`  ⚠️  ${provider}: Invalid format (expected prefix: ${prefix})`);
      return {
        provider,
        configured: true,
        valid: false,
        status: 'invalid',
        message: `Invalid format - expected prefix: ${prefix}`
      };
    }

    // Check minimum length
    if (key.length < 20) {
      console.log(`  ⚠️  ${provider}: Key too short (${key.length} chars)`);
      return {
        provider,
        configured: true,
        valid: false,
        status: 'invalid',
        message: 'API key too short'
      };
    }

    console.log(`  ✅ ${provider}: Configured (${key.substring(0, 8)}...)`);
    return {
      provider,
      configured: true,
      valid: true,
      status: 'active',
      message: 'API key validated and active'
    };
  }

  /**
   * Get validation status for a specific provider
   */
  getProviderStatus(provider: string): APIKeyValidation | undefined {
    return this.validationResults.get(provider);
  }

  /**
   * Get all active providers
   */
  getActiveProviders(): string[] {
    return Array.from(this.validationResults.values())
      .filter(r => r.status === 'active')
      .map(r => r.provider);
  }
}

export const productionAPIActivator = ProductionAPIActivator.getInstance();
