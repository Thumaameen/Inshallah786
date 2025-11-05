import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Authentication
  JWT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  
  // AI Services
  OPENAI_API_KEY: z.string(),
  OPENAI_ORG_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string(),
  
  // Blockchain Networks
  SOLANA_MAINNET_RPC: z.string(),
  SOLANA_NETWORK: z.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
  
  POLYGON_MAINNET_RPC: z.string(),
  POLYGON_NETWORK: z.enum(['mainnet', 'mumbai']).default('mainnet'),
  
  ETH_MAINNET_RPC: z.string(),
  ETH_NETWORK: z.enum(['mainnet', 'goerli']).default('mainnet'),
  
  // Cloud Services
  AZURE_STORAGE_ACCOUNT: z.string(),
  AZURE_STORAGE_KEY: z.string(),
  AZURE_STORAGE_CONNECTION_STRING: z.string(),
  
  GCP_PROJECT_ID: z.string(),
  GCP_KEY_FILE: z.string().optional(),
  
  // Render specific
  RENDER: z.boolean().default(false),
});

// Extract environment variables
const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  SOLANA_MAINNET_RPC: process.env.SOLANA_MAINNET_RPC,
  SOLANA_NETWORK: process.env.SOLANA_NETWORK,
  POLYGON_MAINNET_RPC: process.env.POLYGON_MAINNET_RPC,
  POLYGON_NETWORK: process.env.POLYGON_NETWORK,
  ETH_MAINNET_RPC: process.env.ETH_MAINNET_RPC,
  ETH_NETWORK: process.env.ETH_NETWORK,
  AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY,
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  GCP_KEY_FILE: process.env.GCP_KEY_FILE,
  RENDER: process.env.RENDER === 'true',
});

export default env;

// Validate environment configuration
export const validateEnv = () => {
  try {
    envSchema.parse(process.env);
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
};