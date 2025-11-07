#!/bin/bash

# Ensure the dist/server/config directory exists 
mkdir -p dist/server/config/

# Create env.js with ESM/CommonJS compatibility
cat > dist/server/config/env.js << 'EOF'
// @ts-check

/**
 * Environment configuration for production deployment
 */

const environmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  START_TIME: process.env.START_TIME ? Number(process.env.START_TIME) : Date.now(),
  SYSTEM: {
    nodeVersion: process.env.NODE_VERSION || process.version || 'unknown',
    platform: process.platform || 'unknown',
    arch: process.arch || 'unknown'
  },
  apiKeys: {
    OPENAI: process.env.OPENAI_API_KEY || '',
    ANTHROPIC: process.env.ANTHROPIC_API_KEY || '',
    GOOGLE: process.env.GOOGLE_API_KEY || '',
    ABIS: process.env.DHA_ABIS_API_KEY || '',
    SAPS: process.env.SAPS_API_KEY || '',
    DHA: process.env.DHA_API_KEY || '',
    NPR: process.env.DHA_NPR_API_KEY || '',
    ICAO: process.env.ICAO_PKD_KEY || ''
  },
  environment: {
    nodeVersion: process.env.NODE_VERSION || process.version || '20.19.1'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = environmentConfig;
  module.exports.environmentConfig = environmentConfig;
}

if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = environmentConfig;
  exports.environmentConfig = environmentConfig;
}
EOF

# Also create a TypeScript version
cat > dist/server/config/env.ts << 'EOF'
export interface EnvironmentConfig {
  NODE_ENV: string;
  START_TIME: number;
  SYSTEM: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  apiKeys: {
    OPENAI: string;
    ANTHROPIC: string;
    GOOGLE: string;
    ABIS: string;
    SAPS: string;
    DHA: string;
    NPR: string;
    ICAO: string;
  };
  environment: {
    nodeVersion: string;
  };
}

export const environmentConfig: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  START_TIME: process.env.START_TIME ? Number(process.env.START_TIME) : Date.now(),
  SYSTEM: {
    nodeVersion: process.env.NODE_VERSION || process.version || 'unknown',
    platform: process.platform || 'unknown',
    arch: process.arch || 'unknown'
  },
  apiKeys: {
    OPENAI: process.env.OPENAI_API_KEY || '',
    ANTHROPIC: process.env.ANTHROPIC_API_KEY || '',
    GOOGLE: process.env.GOOGLE_API_KEY || '',
    ABIS: process.env.DHA_ABIS_API_KEY || '',
    SAPS: process.env.SAPS_API_KEY || '',
    DHA: process.env.DHA_API_KEY || '',
    NPR: process.env.DHA_NPR_API_KEY || '',
    ICAO: process.env.ICAO_PKD_KEY || ''
  },
  environment: {
    nodeVersion: process.env.NODE_VERSION || process.version || '20.19.1'
  }
};

export default environmentConfig;
EOF

# Make files executable
chmod +x dist/server/config/env.js

echo "Environment config files created in dist/server/config"
ls -la dist/server/config/
