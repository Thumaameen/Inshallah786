import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class DHAServicesGuarantee {
  private static instance: DHAServicesGuarantee;
  private healthCheckInterval: NodeJS.Timer | null = null;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly CHECK_INTERVAL = 60000; // 1 minute

  private constructor() {}

  static getInstance(): DHAServicesGuarantee {
    if (!this.instance) {
      this.instance = new DHAServicesGuarantee();
    }
    return this.instance;
  }

  async initializeServices(): Promise<void> {
    logger.info('🔒 Initializing DHA Services Guarantee System...');

    try {
      // Validate DHA API credentials
      await this.validateCredentials();
      
      // Initialize secure connections
      await this.initializeSecureConnections();
      
      // Start continuous monitoring
      this.startHealthChecks();
      
      logger.info('✅ DHA Services Guarantee System initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize DHA Services:', error);
      throw error;
    }
  }

  private async validateCredentials(): Promise<void> {
    const requiredCredentials = [
      'DHA_NPR_API_KEY',
      'DHA_NPR_SECRET',
      'DHA_ABIS_API_KEY',
      'DHA_ABIS_SECRET',
      'SAPS_CRC_API_KEY',
      'ICAO_PKD_API_KEY'
    ];

    const missingCredentials = requiredCredentials.filter(
      cred => !process.env[cred]
    );

    if (missingCredentials.length > 0) {
      throw new Error(`Missing required DHA credentials: ${missingCredentials.join(', ')}`);
    }
  }

  private async initializeSecureConnections(): Promise<void> {
    const services = [
      {
        name: 'NPR',
        url: 'https://api.dha.gov.za/npr/v2',
        key: process.env.DHA_NPR_API_KEY,
        secret: process.env.DHA_NPR_SECRET
      },
      {
        name: 'ABIS',
        url: 'https://api.dha.gov.za/abis/v2',
        key: process.env.DHA_ABIS_API_KEY,
        secret: process.env.DHA_ABIS_SECRET
      },
      {
        name: 'SAPS',
        url: 'https://api.saps.gov.za/crc/v1',
        key: process.env.SAPS_CRC_API_KEY
      },
      {
        name: 'ICAO',
        url: 'https://api.icao.int/pkd/v2',
        key: process.env.ICAO_PKD_API_KEY
      }
    ];

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/health`, {
          headers: {
            'Authorization': `Bearer ${service.key}`,
            'X-API-Secret': service.secret || '',
            'X-Client-ID': config.clientId
          }
        });

        if (!response.ok) {
          throw new Error(`${service.name} health check failed: ${response.statusText}`);
        }

        logger.info(`✅ ${service.name} connection verified`);
      } catch (error) {
        logger.error(`❌ Failed to connect to ${service.name}:`, error);
        throw error;
      }
    }
  }

  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.runHealthChecks();
    }, this.CHECK_INTERVAL);
  }

  private async runHealthChecks(): Promise<void> {
    logger.info('🔍 Running DHA services health checks...');

    const services = ['NPR', 'ABIS', 'SAPS', 'ICAO'];
    const results = await Promise.all(
      services.map(service => this.checkServiceHealth(service))
    );

    const failedServices = services.filter((_, index) => !results[index]);
    
    if (failedServices.length > 0) {
      logger.error(`❌ Failed services: ${failedServices.join(', ')}`);
      await this.handleServiceFailure(failedServices);
    } else {
      logger.info('✅ All DHA services operational');
    }
  }

  private async checkServiceHealth(service: string): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        const response = await fetch(
          `https://api.dha.gov.za/${service.toLowerCase()}/v2/health`,
          {
            headers: {
              'Authorization': `Bearer ${process.env[`DHA_${service}_API_KEY`]}`,
              'X-API-Secret': process.env[`DHA_${service}_SECRET`] || '',
              'X-Client-ID': config.clientId
            }
          }
        );

        if (response.ok) {
          return true;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
      } catch (error) {
        attempts++;
        logger.error(`Failed to check ${service} health (attempt ${attempts}):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return false;
  }

  private async handleServiceFailure(failedServices: string[]): Promise<void> {
    logger.error('🚨 Handling DHA service failures...');

    for (const service of failedServices) {
      try {
        // Attempt service recovery
        await this.recoverService(service);
        
        // Log incident
        await this.logServiceIncident(service);
        
        // Send alerts
        await this.sendServiceAlerts(service);
      } catch (error) {
        logger.error(`Failed to handle ${service} failure:`, error);
      }
    }
  }

  private async recoverService(service: string): Promise<void> {
    logger.info(`🔄 Attempting to recover ${service}...`);

    try {
      // Reset connection
      await this.initializeSecureConnections();
      
      // Validate credentials again
      await this.validateCredentials();
      
      logger.info(`✅ ${service} recovered successfully`);
    } catch (error) {
      logger.error(`❌ Failed to recover ${service}:`, error);
      throw error;
    }
  }

  private async logServiceIncident(service: string): Promise<void> {
    const incident = {
      service,
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      recovery_attempts: this.RETRY_ATTEMPTS
    };

    logger.error('Service Incident:', incident);
  }

  private async sendServiceAlerts(service: string): Promise<void> {
    const alert = {
      level: 'CRITICAL',
      service,
      message: `${service} service failure detected`,
      timestamp: new Date().toISOString()
    };

    logger.error('🚨 Service Alert:', alert);
  }

  // Public methods for external health checks
  async verifyAllServices(): Promise<{
    [key: string]: boolean;
  }> {
    const services = ['NPR', 'ABIS', 'SAPS', 'ICAO'];
    const results = await Promise.all(
      services.map(service => this.checkServiceHealth(service))
    );

    return services.reduce((acc, service, index) => {
      acc[service] = results[index];
      return acc;
    }, {} as { [key: string]: boolean });
  }

  async forceServiceRecovery(service: string): Promise<boolean> {
    try {
      await this.recoverService(service);
      return true;
    } catch (error) {
      logger.error(`Failed to force recover ${service}:`, error);
      return false;
    }
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}