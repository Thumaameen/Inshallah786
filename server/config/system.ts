// Environment types and configuration
import dotenv from 'dotenv';
import * as process from 'process';

// Initialize environment
dotenv.config();

export const SYSTEM_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  NODE_VERSION: process.env.NODE_VERSION || '20.19.1',
  START_TIME: Date.now(),
  PLATFORM: 'linux',
  ARCH: 'x64',
  API_KEYS: {
    OPENAI: process.env.OPENAI_API_KEY,
    ANTHROPIC: process.env.ANTHROPIC_API_KEY,
    GOOGLE: process.env.GOOGLE_API_KEY,
    ABIS: process.env.DHA_ABIS_API_KEY,
    SAPS: process.env.SAPS_API_KEY,
    DHA: process.env.DHA_API_KEY,
    NPR: process.env.DHA_NPR_API_KEY,
    ICAO: process.env.ICAO_PKD_KEY
  }
};

export default SYSTEM_CONFIG;