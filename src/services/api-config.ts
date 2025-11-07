import { Connection } from '@solana/web3.js';
import { ethers } from 'ethers';
import { Web3 } from 'web3';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Configuration Interface
interface APIConfig {
  isLive: boolean;
  endpoint: string;
  apiKey?: string;
  network?: string;
}

// Blockchain Networks Configuration
export const blockchainConfig = {
  solana: {
    mainnet: process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    devnet: process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
    network: process.env.SOLANA_NETWORK || 'mainnet-beta'
  },
  polygon: {
    mainnet: process.env.POLYGON_MAINNET_RPC || 'https://polygon-rpc.com',
    mumbai: process.env.POLYGON_TESTNET_RPC || 'https://rpc-mumbai.maticvigil.com',
    network: process.env.POLYGON_NETWORK || 'mainnet'
  },
  ethereum: {
    mainnet: process.env.ETH_MAINNET_RPC || 'https://eth-mainnet.g.alchemy.com/v2/',
    goerli: process.env.ETH_TESTNET_RPC || 'https://eth-goerli.g.alchemy.com/v2/',
    network: process.env.ETH_NETWORK || 'mainnet'
  }
};

// AI Services Configuration
export const aiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: 32000,
    capabilities: ['document-analysis', 'code-generation', 'system-architecture', 'security-audit']
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    maxTokens: 200000,
    capabilities: ['document-generation', 'system-design', 'security-analysis']
  },
  azure: {
    apiKey: process.env.AZURE_OPENAI_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deployments: {
      gpt4: process.env.AZURE_GPT4_DEPLOYMENT || 'gpt-4',
      gpt35: process.env.AZURE_GPT35_DEPLOYMENT || 'gpt-35-turbo'
    }
  },
  gemini: {
    apiKey: process.env.GOOGLE_AI_KEY,
    model: 'gemini-pro',
    maxTokens: 32000
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: 'pplx-70b-online',
    maxTokens: 4096
  },
  together: {
    apiKey: process.env.TOGETHER_API_KEY,
    models: ['openchat', 'mistral', 'llama2']
  }
};

// Cloud Provider Configuration
export const cloudConfig = {
  azure: {
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
    storageKey: process.env.AZURE_STORAGE_KEY,
    containerName: process.env.AZURE_CONTAINER_NAME
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE,
    bucketName: process.env.GCP_BUCKET_NAME
  }
};

// Database Configuration
export const databaseConfig = {
  postgresql: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  sqlite: {
    path: process.env.SQLITE_PATH || ':memory:'
  }
};

// Authentication Configuration
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  session: {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
};

// Initialize Blockchain Connections
export const initBlockchainConnections = () => {
  // Solana Connection
  const solanaConnection = new Connection(
    blockchainConfig.solana[blockchainConfig.solana.network as 'mainnet' | 'devnet'],
    'confirmed'
  );

  // Ethereum Provider
  const ethProvider = new ethers.JsonRpcProvider(
    blockchainConfig.ethereum[blockchainConfig.ethereum.network as 'mainnet' | 'goerli']
  );

  // Polygon Provider
  const polygonProvider = new Web3(
    blockchainConfig.polygon[blockchainConfig.polygon.network as 'mainnet' | 'mumbai']
  );

  return {
    solana: solanaConnection,
    ethereum: ethProvider,
    polygon: polygonProvider
  };
};

// Initialize AI Services
export const initAIServices = () => {
  // OpenAI Client
  const openai = new OpenAI({
    apiKey: aiConfig.openai.apiKey,
    organization: aiConfig.openai.organization
  });

  // Anthropic Client
  const anthropic = new Anthropic({
    apiKey: aiConfig.anthropic.apiKey
  });

  return {
    openai,
    anthropic
  };
};

// Validate Configuration
export const validateConfig = async () => {
  const validations = [];
  
  // Check Blockchain Connections
  try {
    const { solana, ethereum, polygon } = initBlockchainConnections();
    // Validate connections are initialized
    if (solana && ethereum && polygon) {
      validations.push(Promise.resolve(true));
    }
  } catch (error) {
    console.error('Blockchain connection error:', error);
  }

  // Check AI Services
  try {
    const { openai, anthropic } = initAIServices();
    validations.push(
      openai.models.list(),
      anthropic.messages.create({
        model: aiConfig.anthropic.model,
        messages: [{ role: 'user', content: 'Test' }],
        maxTokens: 1
      })
    );
  } catch (error) {
    console.error('AI services error:', error);
  }

  // Check Database Connection
  try {
    if (databaseConfig.postgresql.url) {
      // Database connection check here
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }

  try {
    await Promise.all(validations);
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Export configurations
export {
  APIConfig
};