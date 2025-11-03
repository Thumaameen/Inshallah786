/**
 * SAPS CRC Fallback Service
 * Provides graceful degradation when SAPS CRC API is not available
 */
import { storage } from '../storage.js';

export class SAPSCRCFallback {
  async verifyRecord(idNumber: string): Promise<{
    status: 'success' | 'pending' | 'error';
    hasRecord: boolean;
    message: string;
  }> {
    // Store verification request for later processing
    await storage.set(`saps:crc:pending:${idNumber}`, {
      timestamp: new Date(),
      status: 'pending',
      idNumber
    });

    // Return pending status
    return {
      status: 'pending',
      hasRecord: false,
      message: 'Verification request queued for manual processing'
    };
  }

  async getStatus(): Promise<{
    available: boolean;
    message: string;
  }> {
    return {
      available: false,
      message: 'SAPS CRC service in manual verification mode'
    };
  }
}

export const sapsCRCFallback = new SAPSCRCFallback();