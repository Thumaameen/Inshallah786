import { validateEnv } from '../src/config/env';
import { validateConfig } from '../src/services/api-config';
import { Connection } from '@solana/web3.js';
import { Web3 } from 'web3';
import { ethers } from 'ethers';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

async function validateAll() {
  console.log('🔍 Starting comprehensive service validation...\n');

  // Step 1: Environment Variables
  console.log('📋 Validating environment variables...');
  if (!validateEnv()) {
    console.error('❌ Environment validation failed');
    process.exit(1);
  }
  console.log('✅ Environment variables validated\n');

  // Step 2: Blockchain Networks
  console.log('🔗 Validating blockchain connections...');
  
  // Solana
  try {
    const solana = new Connection(process.env.SOLANA_MAINNET_RPC!);
    await solana.getSlot();
    console.log('✅ Solana connection validated');
  } catch (error) {
    console.error('❌ Solana connection failed:', error);
    process.exit(1);
  }

  // Ethereum
  try {
    const eth = new ethers.JsonRpcProvider(process.env.ETH_MAINNET_RPC);
    await eth.getBlockNumber();
    console.log('✅ Ethereum connection validated');
  } catch (error) {
    console.error('❌ Ethereum connection failed:', error);
    process.exit(1);
  }

  // Polygon
  try {
    const polygon = new Web3(process.env.POLYGON_MAINNET_RPC!);
    await polygon.eth.getBlockNumber();
    console.log('✅ Polygon connection validated');
  } catch (error) {
    console.error('❌ Polygon connection failed:', error);
    process.exit(1);
  }

  console.log('\n🤖 Validating AI services...');
  
  // OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.models.list();
    console.log('✅ OpenAI connection validated');
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error);
    process.exit(1);
  }

  // Anthropic
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Test' }]
    });
    console.log('✅ Anthropic connection validated');
  } catch (error) {
    console.error('❌ Anthropic connection failed:', error);
    process.exit(1);
  }

  // Step 3: Cloud Services
  console.log('\n☁️ Validating cloud services...');
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    console.error('❌ Azure Storage connection string missing');
    process.exit(1);
  }
  if (!process.env.GCP_PROJECT_ID) {
    console.error('❌ GCP Project ID missing');
    process.exit(1);
  }
  console.log('✅ Cloud service credentials validated');

  // Step 4: Database
  console.log('\n📦 Validating database connection...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ Database URL missing');
    process.exit(1);
  }
  console.log('✅ Database configuration validated');

  // Final Configuration Validation
  console.log('\n🔍 Running final configuration check...');
  if (!await validateConfig()) {
    console.error('❌ Final configuration validation failed');
    process.exit(1);
  }

  console.log('\n✅ All systems validated and operational!');
  return true;
}

validateAll().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});