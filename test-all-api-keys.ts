
#!/usr/bin/env node
import 'dotenv/config';

interface TestResult {
  provider: string;
  status: 'success' | 'failed' | 'missing';
  message: string;
  responseTime?: number;
}

async function testOpenAI(): Promise<TestResult> {
  const start = Date.now();
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { provider: 'OpenAI', status: 'missing', message: 'API key not configured' };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { 
        provider: 'OpenAI', 
        status: 'success', 
        message: 'Live and working',
        responseTime 
      };
    } else {
      return { 
        provider: 'OpenAI', 
        status: 'failed', 
        message: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      provider: 'OpenAI', 
      status: 'failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function testAnthropic(): Promise<TestResult> {
  const start = Date.now();
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { provider: 'Anthropic', status: 'missing', message: 'API key not configured' };
    }

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
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { 
        provider: 'Anthropic', 
        status: 'success', 
        message: 'Live and working',
        responseTime 
      };
    } else {
      return { 
        provider: 'Anthropic', 
        status: 'failed', 
        message: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      provider: 'Anthropic', 
      status: 'failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function testGemini(): Promise<TestResult> {
  const start = Date.now();
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { provider: 'Gemini', status: 'missing', message: 'API key not configured' };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { 
        provider: 'Gemini', 
        status: 'success', 
        message: 'Live and working',
        responseTime 
      };
    } else {
      return { 
        provider: 'Gemini', 
        status: 'failed', 
        message: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      provider: 'Gemini', 
      status: 'failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function runAllTests() {
  console.log('\n🧪 COMPREHENSIVE API KEY TESTING');
  console.log('='.repeat(70));
  console.log('Testing all configured API keys with real connections...\n');

  const results = await Promise.all([
    testOpenAI(),
    testAnthropic(),
    testGemini()
  ]);

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'missing' ? '⚪' : '❌';
    const timeStr = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`  ${icon} ${result.provider}: ${result.message}${timeStr}`);
  });

  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Results: ${successCount}/${totalCount} APIs working (${Math.round((successCount/totalCount)*100)}%)`);
  console.log('='.repeat(70) + '\n');

  process.exit(successCount > 0 ? 0 : 1);
}

runAllTests();
