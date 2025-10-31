import { logger } from '../utils/logger.js';
import { getGovAPIConfig, governmentAPIConfig, GovAPIConfig } from '../config/government-apis.js';

interface FailoverOptions {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export class AutomaticFailoverService {
  private static instance: AutomaticFailoverService;
  private failureCount: Map<string, number> = new Map();
  private backupEndpoints: Map<string, string[]> = new Map();

  private constructor() {
    type ServiceEndpoints = {
      [K in keyof typeof governmentAPIConfig]: typeof governmentAPIConfig[K]['baseUrl'][];
    };

    const backupConfig: ServiceEndpoints = {
      DHA_NPR: [
        'https://api.dha.gov.za/npr/v2',
        'https://api.dha.gov.za/npr/v2',
        'https://api.dha.gov.za/npr/v2'
      ],
      DHA_ABIS: [
        'https://api.dha.gov.za/abis/v2',
        'https://api.dha.gov.za/abis/v2',
        'https://api.dha.gov.za/abis/v2'
      ],
      SAPS_CRC: [
        'https://api.saps.gov.za/crc/v1',
        'https://api.saps.gov.za/crc/v1',
        'https://api.saps.gov.za/crc/v1'
      ],
      ICAO_PKD: [
        'https://api.icao.int/pkd/v2',
        'https://api.icao.int/pkd/v2',
        'https://api.icao.int/pkd/v2'
      ]
    };

    // Initialize backup endpoints
    Object.entries(backupConfig).forEach(([service, endpoints]) => {
      this.backupEndpoints.set(service, endpoints);
    });
  }

  static getInstance(): AutomaticFailoverService {
    if (!this.instance) {
      this.instance = new AutomaticFailoverService();
    }
    return this.instance;
  }

  async executeWithFailover(
    service: string,
    operation: (endpoint: string) => Promise<any>,
    options: FailoverOptions = { maxRetries: 3, retryDelay: 1000, timeout: 5000 }
  ): Promise<any> {
    const config = getGovAPIConfig(service as keyof typeof governmentAPIConfig);
    let currentEndpoint = config.baseUrl;
    let attempts = 0;
    
    while (attempts < options.maxRetries) {
      try {
        // Try the current endpoint with timeout
        const result = await Promise.race([
          operation(currentEndpoint),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), options.timeout)
          )
        ]);

        // Success - reset failure count
        this.failureCount.set(service, 0);
        return result;

      } catch (error) {
        attempts++;
        const currentFailures = (this.failureCount.get(service) || 0) + 1;
        this.failureCount.set(service, currentFailures);
        
        logger.warn(`Service ${service} failed. Attempt ${attempts}/${options.maxRetries}`, {
          service,
          endpoint: currentEndpoint,
          error: error instanceof Error ? error.message : String(error),
          failureCount: currentFailures
        });

        // Check if we should try a backup endpoint
        if (attempts < options.maxRetries) {
          const backups = this.backupEndpoints.get(service) || [];
          const backupIndex = attempts - 1;
          
          if (backupIndex < backups.length) {
            const newEndpoint = backups[backupIndex];
            currentEndpoint = newEndpoint as typeof config.baseUrl;
            logger.info(`Switching to backup endpoint: ${currentEndpoint}`);
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, options.retryDelay));
        }
      }
    }

    // If all attempts failed, throw error
    throw new Error(`Service ${service} failed after ${options.maxRetries} attempts`);
  }

  // Example usage for DHA NPR verification
  async verifyIdentity(idNumber: string): Promise<any> {
    return this.executeWithFailover('DHA_NPR', async (endpoint) => {
      const config = getGovAPIConfig('DHA_NPR');
      const headers = new Headers();
      Object.entries(config.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value);
      });

      const response = await fetch(`${endpoint}/verify/${idNumber}`, { headers });

      if (!response.ok) {
        throw new Error(`NPR verification failed: ${response.statusText}`);
      }

      return response.json();
    });
  }

  // Monitor service health
  async checkServiceHealth<T extends keyof typeof governmentAPIConfig>(service: T): Promise<boolean> {
    try {
      await this.executeWithFailover(service, async (endpoint) => {
        const config = getGovAPIConfig(service);
        const headers = new Headers();
        Object.entries(config.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value);
        });

        const response = await fetch(`${endpoint}/health`, { headers });

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.statusText}`);
        }

        return response.json();
      }, {
        maxRetries: 2,
        retryDelay: 500,
        timeout: 3000
      });

      return true;
    } catch (error) {
      logger.error(`Health check failed for ${service}:`, error);
      return false;
    }
  }

  // Get current service status
  getServiceStatus<T extends keyof typeof governmentAPIConfig>(service: T): {
    failures: number;
    currentEndpoint: string;
    isHealthy: boolean;
  } {
    const config = getGovAPIConfig(service);
    return {
      failures: this.failureCount.get(service) || 0,
      currentEndpoint: config.baseUrl,
      isHealthy: (this.failureCount.get(service) || 0) === 0
    };
  }
}

