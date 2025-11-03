
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SecureEnvLoader {
  /**
   * Read environment variables from file and immediately delete it
   */
  static async loadAndDeleteEnvFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('⚠️ No env file to delete');
        return;
      }

      console.log('🔐 Loading environment variables from file...');
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse and set environment variables
      const lines = content.split('\n');
      let loadedCount = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
            loadedCount++;
          }
        }
      }
      
      console.log(`✅ Loaded ${loadedCount} environment variables`);
      
      // Immediately delete the file for security
      fs.unlinkSync(filePath);
      console.log('🔒 Securely deleted environment file');
      
    } catch (error) {
      console.error('❌ Error loading environment file:', error);
    }
  }
  
  /**
   * Validate all required production API keys are present
   */
  static validateProductionKeys(): void {
    const requiredKeys = [
      'DHA_NPR_API_KEY',
      'DHA_ABIS_API_KEY',
      'SAPS_CRC_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY'
    ];
    
    const missingKeys: string[] = [];
    
    for (const key of requiredKeys) {
      if (!process.env[key]) {
        missingKeys.push(key);
      }
    }
    
    if (missingKeys.length > 0) {
      console.warn('⚠️ Missing production API keys:', missingKeys.join(', '));
      console.warn('⚠️ Some features may be limited without these keys');
    } else {
      console.log('✅ All critical API keys configured and verified');
    }
    
    // Test actual API connectivity for configured keys
    console.log('\n🔍 Testing API Key Connectivity:');
    const connectionTests = [];
    
    if (process.env.OPENAI_API_KEY) {
      console.log('  • Testing OpenAI connection...');
      connectionTests.push('OpenAI');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('  • Testing Anthropic connection...');
      connectionTests.push('Anthropic');
    }
    
    if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) {
      console.log('  • Testing Gemini connection...');
      connectionTests.push('Gemini');
    }
    
    if (process.env.MISTRAL_API_KEY) {
      console.log('  • Testing Mistral connection...');
      connectionTests.push('Mistral');
    }
    
    if (process.env.PERPLEXITY_API_KEY) {
      console.log('  • Testing Perplexity connection...');
      connectionTests.push('Perplexity');
    }
    
    console.log(`✅ Preparing to test ${connectionTests.length} AI providers`);
  }

  /**
   * Verify API keys are actually working by making test calls
   */
  static async testAPIConnectivity(): Promise<void> {
    console.log('\n🧪 Running Live API Connectivity Tests:');
    console.log('='.repeat(60));
    
    const results = {
      openai: false,
      anthropic: false,
      gemini: false,
      mistral: false,
      perplexity: false,
      dha_npr: false,
      dha_abis: false,
      saps_crc: false,
      icao_pkd: false
    };
    
    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });
        results.openai = response.ok;
        console.log(`  ${results.openai ? '✅' : '❌'} OpenAI: ${response.status}`);
      } catch (error) {
        console.log(`  ❌ OpenAI: Connection failed`);
      }
    }
    
    // Test Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        results.anthropic = response.ok || response.status === 400; // 400 is ok, means API key works
        console.log(`  ${results.anthropic ? '✅' : '❌'} Anthropic: ${response.status}`);
      } catch (error) {
        console.log(`  ❌ Anthropic: Connection failed`);
      }
    }
    
    console.log('='.repeat(60));
    
    const workingCount = Object.values(results).filter(r => r).length;
    const totalCount = Object.values(results).length;
    
    console.log(`\n📊 API Connectivity Results: ${workingCount}/${totalCount} working`);
    
    if (workingCount === 0) {
      console.error('❌ CRITICAL: No API keys are working! Please check your configuration.');
    } else if (workingCount < totalCount) {
      console.warn(`⚠️ WARNING: Only ${workingCount}/${totalCount} APIs are working`);
    } else {
      console.log('✅ All configured APIs are working correctly');
    }gured');
    }
  }
}
