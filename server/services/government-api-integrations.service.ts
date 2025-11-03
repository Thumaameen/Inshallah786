import axios from 'axios';
import { createHash } from 'crypto';

interface GovernmentAPIConfig {
  baseURL: string;
  apiKey: string;
  secret?: string;
  cert?: string;
}

interface APIStatus {
  name: string;
  status: 'active' | 'error' | 'degraded';
  lastCheck: Date;
}

class GovernmentAPIService {
  private configs: Map<string, GovernmentAPIConfig> = new Map();
  private status: Map<string, APIStatus> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialize DHA APIs
    this.configs.set('dha_npr', {
      baseURL: process.env.DHA_NPR_BASE_URL || '',
      apiKey: process.env.DHA_NPR_API_KEY || '',
      cert: process.env.DHA_NPR_CERT_KEY || ''
    });

    this.configs.set('dha_abis', {
      baseURL: process.env.DHA_ABIS_BASE_URL || '',
      apiKey: process.env.DHA_ABIS_API_KEY || '',
      secret: process.env.DHA_ABIS_SECRET || ''
    });

    // Initialize SAPS APIs
    this.configs.set('saps_crc', {
      baseURL: process.env.SAPS_CRC_BASE_URL || '',
      apiKey: process.env.SAPS_CRC_APT_KEY || ''
    });

    // Initialize SITA APIs
    this.configs.set('sita_eservices', {
      baseURL: process.env.SITA_ESERVICES_BASE_URL || '',
      apiKey: process.env.SITA_ESERVICES_API_KEY || '',
      secret: process.env.SITA_SECRET_KEY || ''
    });

    // Initialize HANIS
    this.configs.set('hanis', {
      baseURL: process.env.HANIS_BASE_URL || 'https://hanis.dha.gov.za/api/v1',
      apiKey: process.env.HANIS_API_KEY || '',
      secret: process.env.HANIS_SECRET_KEY || ''
    });

    // Initialize NIIS
    this.configs.set('niis', {
      baseURL: process.env.NIIS_BASE_URL || 'https://niis.dha.gov.za/api/v1',
      apiKey: process.env.NIIS_API_KEY || ''
    });

    this.verifyConnections();
  }

  private async verifyConnections() {
    const verificationPromises = Array.from(this.configs.entries()).map(
      async ([name, config]) => {
        try {
          await this.testConnection(name, config);
          this.status.set(name, {
            name,
            status: 'active',
            lastCheck: new Date()
          });
        } catch (error) {
          console.error(`Failed to verify ${name}:`, error);
          this.status.set(name, {
            name,
            status: 'error',
            lastCheck: new Date()
          });
        }
      }
    );

    await Promise.all(verificationPromises);
  }

  private async testConnection(name: string, config: GovernmentAPIConfig) {
    // Skip test if API key is not configured
    if (!config.apiKey) {
      throw new Error('API key not configured');
    }

    const headers = {
      'X-API-Key': config.apiKey,
      'Authorization': `Bearer ${config.apiKey}`
    };

    try {
      const response = await axios.get(`${config.baseURL}/health`, { headers });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async verifyIdentity(idNumber: string): Promise<{
    verified: boolean;
    details?: any;
    error?: string;
  }> {
    try {
      // First check NPR
      const nprResult = await this.queryNPR(idNumber);
      if (!nprResult.success) {
        throw new Error('NPR verification failed');
      }

      // Then verify biometrics with HANIS
      const hanisResult = await this.queryHANIS(idNumber);
      if (!hanisResult.success) {
        throw new Error('HANIS verification failed');
      }

      return {
        verified: true,
        details: {
          npr: nprResult.data,
          hanis: hanisResult.data
        }
      };
    } catch (error) {
      console.error('Identity verification error:', error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  private async queryNPR(idNumber: string) {
    const config = this.configs.get('dha_npr');
    if (!config) throw new Error('NPR not configured');

    try {
      const response = await axios.post(
        `${config.baseURL}/verify`,
        { idNumber },
        {
          headers: {
            'X-API-Key': config.apiKey,
            'X-Certificate': config.cert
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('NPR query error:', error);
      return {
        success: false,
        error: 'NPR query failed'
      };
    }
  }

  private async queryHANIS(idNumber: string) {
    const config = this.configs.get('hanis');
    if (!config) throw new Error('HANIS not configured');

    try {
      const response = await axios.post(
        `${config.baseURL}/verify-biometrics`,
        { idNumber },
        {
          headers: {
            'X-API-Key': config.apiKey,
            'X-Secret': config.secret
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('HANIS query error:', error);
      return {
        success: false,
        error: 'HANIS query failed'
      };
    }
  }

  async performBackgroundCheck(idNumber: string): Promise<{
    passed: boolean;
    details?: any;
    error?: string;
  }> {
    try {
      const config = this.configs.get('saps_crc');
      if (!config) throw new Error('SAPS CRC not configured');

      const response = await axios.post(
        `${config.baseURL}/background-check`,
        { idNumber },
        {
          headers: {
            'X-API-Key': config.apiKey
          }
        }
      );

      return {
        passed: true,
        details: response.data
      };
    } catch (error) {
      console.error('Background check error:', error);
      return {
        passed: false,
        error: error instanceof Error ? error.message : 'Background check failed'
      };
    }
  }

  async registerDocument(metadata: any): Promise<boolean> {
    try {
      // Register with DHA Document Management System
      const dmsConfig = this.configs.get('dha_dms');
      if (!dmsConfig) throw new Error('DHA DMS not configured');

      await axios.post(
        `${dmsConfig.baseURL}/register`,
        {
          metadata,
          hash: createHash('sha256')
            .update(JSON.stringify(metadata))
            .digest('hex')
        },
        {
          headers: {
            'X-API-Key': dmsConfig.apiKey
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Document registration error:', error);
      return false;
    }
  }

  async verifyDocument(referenceNumber: string): Promise<{
    valid: boolean;
    metadata?: any;
    error?: string;
  }> {
    try {
      const dmsConfig = this.configs.get('dha_dms');
      if (!dmsConfig) throw new Error('DHA DMS not configured');

      const response = await axios.get(
        `${dmsConfig.baseURL}/verify/${referenceNumber}`,
        {
          headers: {
            'X-API-Key': dmsConfig.apiKey
          }
        }
      );

      return {
        valid: true,
        metadata: response.data
      };
    } catch (error) {
      console.error('Document verification error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  getConnectionStatus() {
    return Array.from(this.status.values());
  }

  isSystemReady(): boolean {
    const requiredAPIs = ['dha_npr', 'dha_abis', 'saps_crc', 'hanis'];
    return requiredAPIs.every(api => 
      this.status.get(api)?.status === 'active'
    );
  }
}

// Export singleton instance
export const governmentAPIs = new GovernmentAPIService();