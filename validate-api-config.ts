import { config } from 'dotenv';

// Load environment variables
config();

interface ApiConfig {
  name: string;
  key: string;
  testUrl?: string;
  required: boolean;
}

const API_CONFIGS: ApiConfig[] = [
  {
    name: 'OpenAI',
    key: 'OPENAI_API_KEY',
    testUrl: 'https://api.openai.com/v1/models',
    required: true
  },
  {
    name: 'Anthropic',
    key: 'ANTHROPIC_API_KEY',
    testUrl: 'https://api.anthropic.com/v1/messages',
    required: true
  },
  {
    name: 'Mistral',
    key: 'MISTRAL_API_KEY',
    testUrl: 'https://api.mistral.ai/v1/models',
    required: true
  },
  {
    name: 'Gemini',
    key: 'GEMINI_API_KEY',
    required: true
  },
  {
    name: 'Perplexity',
    key: 'PERPLEXITY_API_KEY',
    required: true
  },
  {
    name: 'DHA NPR',
    key: 'DHA_NPR_API_KEY',
    required: true
  },
  {
    name: 'DHA ABIS',
    key: 'DHA_ABIS_API_KEY',
    required: true
  },
  {
    name: 'SAPS CRC',
    key: 'SAPS_CRC_API_KEY',
    required: true
  },
  {
    name: 'ICAO PKD',
    key: 'ICAO_PKD_API_KEY',
    required: true
  }
];

async function validateApiKey(config: ApiConfig) {
  const value = process.env[config.key];
  
  if (!value) {
    return {
      name: config.name,
      status: 'missing',
      required: config.required
    };
  }

  if (config.testUrl) {
    try {
      const response = await fetch(config.testUrl, {
        headers: {
          'Authorization': `Bearer ${value}`
        }
      });

      return {
        name: config.name,
        status: response.ok ? 'valid' : 'invalid',
        required: config.required
      };
    } catch (error) {
      return {
        name: config.name,
        status: 'error',
        required: config.required,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  return {
    name: config.name,
    status: 'configured',
    required: config.required
  };
}

async function validateConfiguration() {
  console.log('🔍 Validating API Configuration...\n');

  const results = await Promise.all(API_CONFIGS.map(validateApiKey));
  
  let missingRequired = 0;
  
  results.forEach(result => {
    const icon = result.status === 'valid' ? '✅' : 
                result.status === 'configured' ? '✅' :
                result.status === 'missing' ? '❌' : '⚠️';
                
    console.log(`${icon} ${result.name}: ${result.status}`);
    
    if (result.required && (result.status === 'missing' || result.status === 'invalid')) {
      missingRequired++;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`Total APIs: ${results.length}`);
  console.log(`Missing Required: ${missingRequired}`);
  
  if (missingRequired > 0) {
    console.log('\n⚠️ Action Required:');
    console.log('1. Add missing API keys to Render environment variables');
    console.log('2. Run validation again after adding keys');
  } else {
    console.log('\n✅ All required API keys are configured');
  }
}

validateConfiguration().catch(console.error);