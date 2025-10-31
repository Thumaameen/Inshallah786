import { logger } from '../utils/logger.js';
import { getGovAPIConfig } from '../config/government-apis.js';

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
    // Configure backup endpoints for each service
    this.backupEndpoints.set('DHA_NPR', [
      'https://backup1.dha.gov.za/npr/v2',
      'https://backup2.dha.gov.za/npr/v2',
      'https://dr-site.dha.gov.za/npr/v2'
    ]);

    this.backupEndpoints.set('DHA_ABIS', [
      'https://backup1.dha.gov.za/abis/v2',
      'https://backup2.dha.gov.za/abis/v2',
      'https://dr-site.dha.gov.za/abis/v2'
    ]);

    this.backupEndpoints.set('SAPS_CRC', [
      'https://backup1.saps.gov.za/crc/v1',
      'https://backup2.saps.gov.za/crc/v1'
    ]);

    this.backupEndpoints.set('ICAO_PKD', [
      'https://backup1.icao.int/pkd/v2',
      'https://backup2.icao.int/pkd/v2'
    ]);
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
          error: error.message,
          failureCount: currentFailures
        });

        // Check if we should try a backup endpoint
        if (attempts < options.maxRetries) {
          const backups = this.backupEndpoints.get(service) || [];
          const backupIndex = attempts - 1;
          
          if (backupIndex < backups.length) {
            currentEndpoint = backups[backupIndex];
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
      const response = await fetch(`${endpoint}/verify/${idNumber}`, {
        headers: config.headers
      });

      if (!response.ok) {
        throw new Error(`NPR verification failed: ${response.statusText}`);
      }

      return response.json();
    });
  }

  // Monitor service health
  async checkServiceHealth(service: string): Promise<boolean> {
    try {
      await this.executeWithFailover(service, async (endpoint) => {
        const config = getGovAPIConfig(service as keyof typeof governmentAPIConfig);
        const response = await fetch(`${endpoint}/health`, {
          headers: config.headers
        });

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
  getServiceStatus(service: string): {
    failures: number;
    currentEndpoint: string;
    isHealthy: boolean;
  } {
    const config = getGovAPIConfig(service as keyof typeof governmentAPIConfig);
    return {
      failures: this.failureCount.get(service) || 0,
      currentEndpoint: config.baseUrl,
      isHealthy: (this.failureCount.get(service) || 0) === 0
    };
  }
}