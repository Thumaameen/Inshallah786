import axios from 'axios';
import { createHash, createHmac } from 'crypto';

export class DHAApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor() {
    this.baseUrl = process.env.DHA_API_URL || 'https://api.dha.gov.za';
    this.apiKey = process.env.DHA_API_KEY || '';
    this.secretKey = process.env.DHA_SECRET_KEY || '';
  }

  /**
   * Sign document with DHA digital signature
   */
  async signDocument(documentHash: string) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('sign_document', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/documents/sign`, {
        documentHash,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return response.data.signature;
    } catch (error) {
      console.error('DHA document signing error:', error);
      throw new Error('Failed to sign document with DHA');
    }
  }

  /**
   * Register document with DHA system
   */
  async registerDocument(registrationData: any) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('register_document', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/documents/register`, {
        ...registrationData,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return {
        verificationCode: response.data.verificationCode,
        registrationNumber: response.data.registrationNumber
      };
    } catch (error) {
      console.error('DHA document registration error:', error);
      throw new Error('Failed to register document with DHA');
    }
  }

  /**
   * Verify document with DHA system
   */
  async verifyWithDHA(documentId: string) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('verify_document', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/documents/verify`, {
        documentId,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return {
        status: response.data.status,
        realTimeVerification: response.data.realTimeVerification,
        verificationDetails: response.data.details
      };
    } catch (error) {
      console.error('DHA document verification error:', error);
      throw new Error('Failed to verify document with DHA');
    }
  }

  /**
   * Verify with National Population Register
   */
  async verifyWithNPR(documentData: any) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('verify_npr', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/npr/verify`, {
        ...documentData,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return {
        success: response.data.success,
        signature: response.data.signature,
        details: response.data.details
      };
    } catch (error) {
      console.error('NPR verification error:', error);
      throw new Error('Failed to verify with NPR');
    }
  }

  /**
   * Verify with Automated Biometric Identification System
   */
  async verifyWithABIS(documentData: any) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('verify_abis', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/abis/verify`, {
        ...documentData,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return {
        success: response.data.success,
        signature: response.data.signature,
        biometricMatch: response.data.biometricMatch
      };
    } catch (error) {
      console.error('ABIS verification error:', error);
      throw new Error('Failed to verify with ABIS');
    }
  }

  /**
   * Verify with South African Police Service
   */
  async verifyWithSAPS(documentData: any) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature('verify_saps', timestamp);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/saps/verify`, {
        ...documentData,
        timestamp
      }, {
        headers: {
          'X-DHA-API-Key': this.apiKey,
          'X-DHA-Signature': signature,
          'X-DHA-Timestamp': timestamp
        }
      });

      return {
        success: response.data.success,
        signature: response.data.signature,
        policeVerification: response.data.verification
      };
    } catch (error) {
      console.error('SAPS verification error:', error);
      throw new Error('Failed to verify with SAPS');
    }
  }

  /**
   * Generate HMAC signature for API requests
   */
  private generateSignature(action: string, timestamp: string): string {
    const content = `${action}${timestamp}${this.apiKey}`;
    return createHmac('sha256', this.secretKey)
      .update(content)
      .digest('hex');
  }

  /**
   * Calculate document hash for verification
   */
  private calculateDocumentHash(content: any): string {
    return createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');
  }
}

export const dhaApiService = new DHAApiService();