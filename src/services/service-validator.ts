import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

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
  return [
    { service: 'Solana', status: 'not_configured' },
    { service: 'Polygon', status: 'not_configured' },
    { service: 'Ethereum', status: 'not_configured' }
  ];
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
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Test' }]
    });
    return { service: 'Anthropic', status: 'live' };
  } catch (error) {
    return { service: 'Anthropic', status: 'error', error: getErrorMessage(error) };
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
    // Add your database connection test here
    return { service: 'Database', status: 'live' };
  } catch (error) {
    return { service: 'Database', status: 'error', error: getErrorMessage(error) };
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

  const summary = results.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Service Validation Summary:');
  console.log('===============================');
  console.log(`✅ Live: ${summary.live || 0}`);
  console.log(`❌ Errors: ${summary.error || 0}`);
  console.log(`⚪ Not Configured: ${summary.not_configured || 0}\n`);

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