import { fetch } from 'cross-fetch';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

interface ServiceTest {
  name: string;
  testFn: () => Promise<boolean>;
  required: boolean;
}

class KeyValidationService {
  private static instance: KeyValidationService;
  private results: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): KeyValidationService {
    if (!this.instance) {
      this.instance = new KeyValidationService();
    }
    return this.instance;
  }

  async validateDHAKeys(): Promise<void> {
    console.log('\n🔐 Testing DHA Service Keys...');
    
    const tests: ServiceTest[] = [
      {
        name: 'NPR API',
        testFn: async () => {
          try {
            const response = await fetch('https://npr.dha.gov.za/api/health', {
              headers: {
                'Authorization': `Bearer ${process.env.DHA_NPR_API_KEY}`,
                'X-API-Secret': process.env.DHA_NPR_SECRET || ''
              }
            });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        },
        required: true
      },
      {
        name: 'ABIS System',
        testFn: async () => {
          try {
            const response = await fetch('https://abis.dha.gov.za/api/v2/health', {
              headers: {
                'Authorization': `Bearer ${process.env.DHA_ABIS_API_KEY}`,
                'X-API-Secret': process.env.DHA_ABIS_SECRET || ''
              }
            });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        },
        required: true
      },
      {
        name: 'Document Management',
        testFn: async () => {
          try {
            const response = await fetch('https://dms.dha.gov.za/api/health', {
              headers: {
                'Authorization': `Bearer ${process.env.DHA_DMS_API_KEY}`,
                'X-API-Secret': process.env.DHA_DMS_SECRET || ''
              }
            });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        },
        required: true
      }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      const result = await test.testFn();
      this.results.set(test.name, result);
      console.log(result ? '✅' : (test.required ? '❌' : '⚠️'));
    }
  }

  async validateDocumentKeys(): Promise<void> {
    console.log('\n📄 Testing Document Generation Keys...');

    const testSign = (data: string): boolean => {
      try {
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.sign(process.env.DOC_PKI_PRIVATE_KEY || '', 'base64');
        return true;
      } catch {
        return false;
      }
    };

    const testEncryption = (data: string): boolean => {
      try {
        const cipher = crypto.createCipher('aes-256-gcm', process.env.DOC_ENCRYPTION_KEY || '');
        cipher.update(data, 'utf8', 'hex');
        cipher.final('hex');
        return true;
      } catch {
        return false;
      }
    };

    const tests: ServiceTest[] = [
      {
        name: 'PKI Signing',
        testFn: async () => testSign('test document data'),
        required: true
      },
      {
        name: 'Document Encryption',
        testFn: async () => testEncryption('test document data'),
        required: true
      },
      {
        name: 'ICAO PKD',
        testFn: async () => {
          try {
            const response = await fetch('https://pkd.icao.int/api/health', {
              headers: {
                'Authorization': `Bearer ${process.env.ICAO_PKD_API_KEY}`,
                'X-API-Secret': process.env.ICAO_PKD_SECRET || ''
              }
            });
            return response.status === 200;
          } catch {
            return false;
          }
        },
        required: true
      }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      const result = await test.testFn();
      this.results.set(test.name, result);
      console.log(result ? '✅' : (test.required ? '❌' : '⚠️'));
    }
  }

  async validateStorageKeys(): Promise<void> {
    console.log('\n💾 Testing Storage Keys...');

    const tests: ServiceTest[] = [
      {
        name: 'Document Storage',
        testFn: async () => {
          try {
            const testPath = 'test/validation.txt';
            const testContent = 'Key validation test';
            
            // Test write
            await fs.writeFile(path.join(process.cwd(), testPath), testContent);
            
            // Test read
            const content = await fs.readFile(path.join(process.cwd(), testPath), 'utf8');
            
            // Cleanup
            await fs.unlink(path.join(process.cwd(), testPath));
            
            return content === testContent;
          } catch {
            return false;
          }
        },
        required: true
      }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      const result = await test.testFn();
      this.results.set(test.name, result);
      console.log(result ? '✅' : (test.required ? '❌' : '⚠️'));
    }
  }

  async validateSecurityKeys(): Promise<void> {
    console.log('\n🔒 Testing Security & Audit Keys...');

    const tests: ServiceTest[] = [
      {
        name: 'Audit Trail',
        testFn: async () => {
          try {
            const testEvent = {
              type: 'KEY_VALIDATION',
              timestamp: new Date().toISOString(),
              success: true
            };
            
            const encrypted = crypto.createHmac('sha256', process.env.AUDIT_ENCRYPTION_KEY || '')
              .update(JSON.stringify(testEvent))
              .digest('hex');
            
            return encrypted.length === 64;
          } catch {
            return false;
          }
        },
        required: true
      },
      {
        name: 'Security Alerts',
        testFn: async () => {
          try {
            const response = await fetch(process.env.SECURITY_WEBHOOK_URL || '', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.SECURITY_ALERT_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'TEST',
                severity: 'INFO',
                message: 'Key validation test'
              })
            });
            return response.status === 200;
          } catch {
            return false;
          }
        },
        required: false
      }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      const result = await test.testFn();
      this.results.set(test.name, result);
      console.log(result ? '✅' : (test.required ? '❌' : '⚠️'));
    }
  }

  printSummary(): void {
    console.log('\n📊 Validation Summary');
    console.log('===================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    this.results.forEach((result, name) => {
      console.log(`${name}: ${result ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++;
      if (result) passedTests++;
    });
    
    const percentage = (passedTests / totalTests * 100).toFixed(1);
    console.log('\n🎯 Results:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Success Rate: ${percentage}%`);
    
    if (percentage === '100.0') {
      console.log('\n✨ All keys validated successfully!');
    } else {
      console.log('\n⚠️ Some keys require attention. Check failed tests above.');
    }
  }
}

async function runValidation() {
  const validator = KeyValidationService.getInstance();
  
  console.log('🚀 Starting DHA Key Validation');
  console.log('=============================');
  
  try {
    await validator.validateDHAKeys();
    await validator.validateDocumentKeys();
    await validator.validateStorageKeys();
    await validator.validateSecurityKeys();
    validator.printSummary();
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

runValidation().catch(console.error);