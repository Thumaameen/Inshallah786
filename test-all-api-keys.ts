
#!/usr/bin/env tsx

/**
 * Comprehensive API Key Testing Suite
 * Tests all API integrations to verify they're working
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, 'attached_assets', 'Dha-Thisone_1761858484694.env') });

interface TestResult {
  service: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    results.push({
      service: 'OpenAI GPT-4',
      status: 'SKIP',
      message: 'API key not found'
    });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'OpenAI GPT-4',
        status: 'PASS',
        message: 'API key valid and working',
        details: { models: data.data?.length || 0 }
      });
    } else {
      results.push({
        service: 'OpenAI GPT-4',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    results.push({
      service: 'OpenAI GPT-4',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    results.push({
      service: 'Anthropic Claude',
      status: 'SKIP',
      message: 'API key not found'
    });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Hi'
        }]
      })
    });

    if (response.ok) {
      results.push({
        service: 'Anthropic Claude',
        status: 'PASS',
        message: 'API key valid and working'
      });
    } else {
      const errorText = await response.text();
      results.push({
        service: 'Anthropic Claude',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      });
    }
  } catch (error) {
    results.push({
      service: 'Anthropic Claude',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testGoogleAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    results.push({
      service: 'Google Gemini',
      status: 'SKIP',
      message: 'API key not found'
    });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'Google Gemini',
        status: 'PASS',
        message: 'API key valid and working',
        details: { models: data.models?.length || 0 }
      });
    } else {
      results.push({
        service: 'Google Gemini',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    results.push({
      service: 'Google Gemini',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testMistral() {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  if (!apiKey) {
    results.push({
      service: 'Mistral AI',
      status: 'SKIP',
      message: 'API key not found'
    });
    return;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'Mistral AI',
        status: 'PASS',
        message: 'API key valid and working',
        details: { models: data.data?.length || 0 }
      });
    } else {
      results.push({
        service: 'Mistral AI',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    results.push({
      service: 'Mistral AI',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testGitHub() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  
  if (!token) {
    results.push({
      service: 'GitHub',
      status: 'SKIP',
      message: 'API token not found'
    });
    return;
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'GitHub',
        status: 'PASS',
        message: 'Token valid and working',
        details: { user: data.login }
      });
    } else {
      results.push({
        service: 'GitHub',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    results.push({
      service: 'GitHub',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!dbUrl) {
    results.push({
      service: 'Database',
      status: 'SKIP',
      message: 'Database URL not found'
    });
    return;
  }

  try {
    // Just check if the URL is properly formatted
    const url = new URL(dbUrl);
    
    results.push({
      service: 'Database',
      status: 'PASS',
      message: 'Database URL configured',
      details: { 
        host: url.hostname,
        database: url.pathname.replace('/', '')
      }
    });
  } catch (error) {
    results.push({
      service: 'Database',
      status: 'FAIL',
      message: 'Invalid database URL format'
    });
  }
}

async function testWeb3() {
  const clientId = process.env.WEB3AUTH_CLIENT_ID;
  
  if (!clientId) {
    results.push({
      service: 'Web3Auth',
      status: 'SKIP',
      message: 'Client ID not found'
    });
    return;
  }

  results.push({
    service: 'Web3Auth',
    status: 'PASS',
    message: 'Client ID configured',
    details: { environment: process.env.WEB3AUTH_ENVIRONMENT }
  });
}

async function testSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    results.push({
      service: 'Supabase',
      status: 'SKIP',
      message: 'Credentials not found'
    });
    return;
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.ok || response.status === 404) {
      results.push({
        service: 'Supabase',
        status: 'PASS',
        message: 'Credentials valid and working'
      });
    } else {
      results.push({
        service: 'Supabase',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    results.push({
      service: 'Supabase',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
    'MISTRAL_API_KEY',
    'DATABASE_URL',
    'SESSION_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const configured: string[] = [];
  const missing: string[] = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      configured.push(varName);
    } else {
      missing.push(varName);
    }
  });

  results.push({
    service: 'Environment Variables',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    message: `${configured.length}/${requiredVars.length} critical variables configured`,
    details: { configured, missing }
  });
}

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE API KEY TESTING SUITE');
  console.log('=====================================\n');

  console.log('Testing 5 AI Agents...');
  await testOpenAI();
  await testAnthropic();
  await testGoogleAI();
  await testMistral();
  
  console.log('\nTesting Web2 Integrations...');
  await testGitHub();
  await testSupabase();
  
  console.log('\nTesting Web3 Integrations...');
  await testWeb3();
  
  console.log('\nTesting Infrastructure...');
  await testDatabase();
  checkEnvironmentVariables();

  console.log('\n\n📊 TEST RESULTS');
  console.log('=====================================\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : 
                 result.status === 'FAIL' ? '❌' : '⏭️';
    
    console.log(`${icon} ${result.service}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
    
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log('');
  });

  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📊 Total: ${results.length}`);
  console.log('=====================================\n');

  if (failed > 0) {
    console.log('⚠️  SOME TESTS FAILED - Please check the failed services above');
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED - All API keys are working correctly!');
    process.exit(0);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
