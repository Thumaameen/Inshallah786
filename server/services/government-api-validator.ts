import { getGovAPIConfig } from '../config/government-apis.js';
import { logger } from '../utils/logger.js';

export class GovernmentAPIValidator {
  private static instance: GovernmentAPIValidator;

  private constructor() {}

  static getInstance(): GovernmentAPIValidator {
    if (!this.instance) {
      this.instance = new GovernmentAPIValidator();
    }
    return this.instance;
  }

  async validateDHAAccess(): Promise<boolean> {
    try {
      const config = getGovAPIConfig('DHA_NPR');
      const response = await fetch(`${config.baseUrl}/health`, {
        headers: config.headers
      });
      return response.status === 200;
    } catch (error) {
      logger.error('DHA NPR access validation failed:', error);
      return false;
    }
  }

  async validateABISAccess(): Promise<boolean> {
    try {
      const config = getGovAPIConfig('DHA_ABIS');
      const response = await fetch(`${config.baseUrl}/health`, {
        headers: config.headers
      });
      return response.status === 200;
    } catch (error) {
      logger.error('DHA ABIS access validation failed:', error);
      return false;
    }
  }

  async validateSAPSAccess(): Promise<boolean> {
    try {
      const config = getGovAPIConfig('SAPS_CRC');
      const response = await fetch(`${config.baseUrl}/health`, {
        headers: config.headers
      });
      return response.status === 200;
    } catch (error) {
      logger.error('SAPS CRC access validation failed:', error);
      return false;
    }
  }

  async validateICAOAccess(): Promise<boolean> {
    try {
      const config = getGovAPIConfig('ICAO_PKD');
      const response = await fetch(`${config.baseUrl}/health`, {
        headers: config.headers
      });
      return response.status === 200;
    } catch (error) {
      logger.error('ICAO PKD access validation failed:', error);
      return false;
    }
  }

  async validateAllServices(): Promise<{
    dha: boolean;
    abis: boolean;
    saps: boolean;
    icao: boolean;
  }> {
    const [dha, abis, saps, icao] = await Promise.all([
      this.validateDHAAccess(),
      this.validateABISAccess(),
      this.validateSAPSAccess(),
      this.validateICAOAccess()
    ]);

    return { dha, abis, saps, icao };
  }
}