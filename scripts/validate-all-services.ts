import { validateConfig } from '../src/services/api-config';
import { Connection } from '@solana/web3.js';
import { Web3 } from 'web3';
import { ethers } from 'ethers';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

async function testBlockchainConnections() {
  console.log('🔗 Testing Blockchain Connections...');

  // Test Solana
  try {
    const solanaConnection = new Connection(process.env.SOLANA_MAINNET_RPC || '');
    const slot = await solanaConnection.getSlot();
    console.log('✅ Solana connection successful - Current slot:', slot);
  } catch (error) {
    console.error('❌ Solana connection failed:', error);
  }

  // Test Ethereum
  try {
    const ethProvider = new ethers.JsonRpcProvider(process.env.ETH_MAINNET_RPC || '');
    const blockNumber = await ethProvider.getBlockNumber();
    console.log('✅ Ethereum connection successful - Block number:', blockNumber);
  } catch (error) {
    console.error('❌ Ethereum connection failed:', error);
  }

  // Test Polygon
  try {
    const polygonProvider = new Web3(process.env.POLYGON_MAINNET_RPC || '');
    const blockNumber = await polygonProvider.eth.getBlockNumber();
    console.log('✅ Polygon connection successful - Block number:', blockNumber);
  } catch (error) {
    console.error('❌ Polygon connection failed:', error);
  }
}

async function testAIServices() {
  console.log('\n🤖 Testing AI Services...');

  // Test OpenAI
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    const models = await openai.models.list();
    console.log('✅ OpenAI connection successful - Available models:', models.data.length);
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error);
  }

  // Test Anthropic
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Test' }]
    });
    console.log('✅ Anthropic connection successful');
  } catch (error) {
    console.error('❌ Anthropic connection failed:', error);
  }
}

async function testCloudServices() {
  console.log('\n☁️ Testing Cloud Services...');

  // Test Azure
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    try {
      console.log('✅ Azure credentials found');
    } catch (error) {
      console.error('❌ Azure configuration error:', error);
    }
  } else {
    console.log('⚠️ Azure storage connection string not found');
  }

  // Test GCP
  if (process.env.GCP_PROJECT_ID && process.env.GCP_KEY_FILE) {
    try {
      console.log('✅ GCP credentials found');
    } catch (error) {
      console.error('❌ GCP configuration error:', error);
    }
  } else {
    console.log('⚠️ GCP credentials not found');
  }
}

async function testDatabase() {
  console.log('\n📦 Testing Database Connection...');

  if (process.env.DATABASE_URL) {
    try {
      console.log('✅ Database URL found');
      // Add your database connection test here
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  } else {
    console.log('⚠️ Database URL not found');
  }
}

async function main() {
  console.log('🚀 Starting API Key and Service Validation\n');

  await testBlockchainConnections();
  await testAIServices();
  await testCloudServices();
  await testDatabase();

  console.log('\n🔍 Running comprehensive config validation...');
  const isValid = await validateConfig();
  
  if (isValid) {
    console.log('\n✅ All systems operational');
  } else {
    console.log('\n⚠️ Some services require attention');
  }
}

main().catch(console.error);