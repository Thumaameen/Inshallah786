// @ts-nocheck
/**
 * SAPS Criminal Record Check (CRC) Service
 * Handles integration with SAPS CRC API with circuit breaker pattern
 */
import { CircuitBreaker } from '../utils/circuit-breaker.js';
import { sapsCRCFallback } from './saps-crc-fallback.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

export class SAPSCRCService {
  private circuitBreaker: CircuitBreaker;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = sapsConfig.saps.crcEndpoint;
    this.apiKey = sapsConfig.saps.apiKey;

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
      monitor: true,
      onStateChange: (state) => {
        logger.warn(`SAPS CRC Circuit Breaker state changed to: ${state}`);
      }
    });
  }

  async verifyRecord(idNumber: string) {
    try {
      return await this.circuitBreaker.execute(async () => {
        const response = await fetch(`${this.baseUrl}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify({ idNumber })
        });

        if (!response.ok) {
          throw new Error(`SAPS CRC API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          status: 'success',
          hasRecord: data.hasRecord,
          message: data.message
        };
      });
    } catch (error) {
      logger.error('SAPS CRC verification failed, falling back to manual process', error);
      return sapsCRCFallback.verifyRecord(idNumber);
    }
  }

  async getStatus() {
    try {
      return await this.circuitBreaker.execute(async () => {
        const response = await fetch(`${this.baseUrl}/status`, {
          headers: {
            'X-API-Key': this.apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`SAPS CRC API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          available: data.available,
          message: data.message
        };
      });
    } catch (error) {
      logger.error('SAPS CRC status check failed', error);
      return sapsCRCFallback.getStatus();
    }
  }
}

export const sapsCRCService = new SAPSCRCService();

interface SAPSConfig {
  crcEndpoint: string;
  apiKey: string;
}

interface Config {
  saps: SAPSConfig;
}

export const sapsConfig: Config = {
  saps: {
    crcEndpoint: process.env.SAPS_CRC_ENDPOINT || 'https://api.saps.gov.za/crc',
    apiKey: process.env.SAPS_API_KEY || ''
  }
};