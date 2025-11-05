import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Avoid relying on the @anthropic-ai/sdk package which may not be installed in this environment.
// Use direct HTTP requests to Anthropic's API instead.
dotenv.config();

interface ValidationResult {
  service: string;
  status: 'live' | 'error' | 'not_configured';
  error?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    if (typeof error === 'string') return error;
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function validateBlockchainServices(): Promise<ValidationResult[]> {
  const services = [
    { name: 'Solana', envKey: 'SOLANA_MAINNET_RPC' },
    { name: 'Polygon', envKey: 'POLYGON_MAINNET_RPC' },
    { name: 'Ethereum', envKey: 'ETH_MAINNET_RPC' }
  ];

  return services.map(({ name, envKey }) => {
    if (!process.env[envKey]) {
      return { service: name, status: 'not_configured' };
    }
    // For now, we'll just check if the RPC URL is configured
    return { service: name, status: 'live' };
  });
}

async function validateOpenAI(): Promise<ValidationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { service: 'OpenAI', status: 'not_configured' };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.models.list();
    return { service: 'OpenAI', status: 'live' };
  } catch (error) {
    return { service: 'OpenAI', status: 'error', error: getErrorMessage(error) };
  }
}
async function validateAnthropic(): Promise<ValidationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { service: 'Anthropic', status: 'not_configured' };
  }

  try {
    // Simple lightweight health-check using Anthropic HTTP API to avoid requiring the SDK.
    // Uses x-api-key header (Anthropic accepts x-api-key) and a minimal prompt to verify access.
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens_to_sample: 1,
        prompt: 'Human: Test\nAssistant:'
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return { service: 'Anthropic', status: 'live' };
  } catch (error) {
    return { service: 'Anthropic', status: 'error', error: getErrorMessage(error) };
  }
}
}

async function validateGemini(): Promise<ValidationResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { service: 'Gemini', status: 'not_configured' };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { service: 'Gemini', status: 'live' };
  } catch (error) {
    return { service: 'Gemini', status: 'error', error: getErrorMessage(error) };
  }
}

async function validateDatabase(): Promise<ValidationResult> {
  if (!process.env.DATABASE_URL) {
    return { service: 'Database', status: 'not_configured' };
  }

  try {
    const url = new URL(process.env.DATABASE_URL);
    if (!url.protocol || !url.host) {
      throw new Error('Invalid database URL format');
    }
    
    // Test connection based on protocol
    if (url.protocol === 'postgresql:' || url.protocol === 'postgres:') {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query('SELECT 1');
      await pool.end();
    } else if (url.protocol === 'sqlite:') {
      const sqlite = await import('better-sqlite3');
      const db = new sqlite.default(url.pathname);
      db.prepare('SELECT 1').get();
      db.close();
    }
    
    return { service: 'Database', status: 'live' };
  } catch (error) {
    return { 
      service: 'Database', 
      status: 'error', 
      error: getErrorMessage(error) 
    };
  }
}

export async function validateAllServices(): Promise<ValidationResult[]> {
  // Get blockchain validations
  const blockchainResults = await validateBlockchainServices();
  
  const results = await Promise.all([
    ...blockchainResults,
    validateOpenAI(),
    validateAnthropic(),
    validateGemini(),
    validateDatabase()
  ]);

  const summary = results.reduce<Record<ValidationResult['status'], number>>((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {
    live: 0,
    error: 0,
    not_configured: 0
  });

  const totalServices = Object.values(summary).reduce((a, b) => a + b, 0);
  const percentageLive = ((summary.live || 0) / totalServices * 100).toFixed(1);
  
  console.log('\n📊 Service Validation Summary');
  console.log('==============================');
  console.log(`Total Services: ${totalServices}`);
  console.log(`✅ Live: ${summary.live || 0} (${percentageLive}%)`);
  console.log(`❌ Errors: ${summary.error || 0}`);
  console.log(`⚪ Not Configured: ${summary.not_configured || 0}`);
  
  if (summary.error > 0) {
    console.log('\n⚠️  Services with Errors:');
    results
      .filter(r => r.status === 'error')
      .forEach(r => console.log(`   • ${r.service}: ${r.error || 'Unknown error'}`));
  }

  return results;
}

export async function validateServicesForProduction(): Promise<boolean> {
  const results = await validateAllServices();
  
  // Required services for production
  const requiredServices = ['Database', 'OpenAI', 'Anthropic'];
  
  const missingRequired = requiredServices.filter(required => {
    const service = results.find(r => r.service === required);
    return !service || service.status !== 'live';
  });

  if (missingRequired.length > 0) {
    console.error('\n❌ Missing required services for production:');
    missingRequired.forEach(service => {
      console.error(`  • ${service}`);
    });
    return false;
  }

  return true;
}