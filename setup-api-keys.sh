#!/bin/bash

# Create .env file
cat > .env << EOL
# Core Environment
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# AI Service Keys (Replace with your actual keys)
OPENAI_API_KEY=YOUR_OPENAI_KEY
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
MISTRAL_API_KEY=YOUR_MISTRAL_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
PERPLEXITY_API_KEY=YOUR_PERPLEXITY_KEY

# Government & DHA APIs
DHA_NPR_API_KEY=YOUR_NPR_KEY
DHA_NPR_BASE_URL=https://npr-prod.dha.gov.za/api/v1
DHA_NPR_TIMEOUT=45000
DHA_NPR_RETRY_COUNT=3

DHA_ABIS_API_KEY=YOUR_ABIS_KEY
DHA_ABIS_BASE_URL=https://abis-prod.dha.gov.za/api/v1
DHA_ABIS_TIMEOUT=60000
DHA_ABIS_MAX_BATCH=50

SAPS_CRC_API_KEY=YOUR_SAPS_KEY
SAPS_CRC_BASE_URL=https://crc-api.saps.gov.za/v1

ICAO_PKD_API_KEY=YOUR_ICAO_KEY
ICAO_PKD_BASE_URL=https://pkddownloadsg.icao.int

SITA_API_KEY=YOUR_SITA_KEY
SITA_API_BASE_URL=https://api.sita.co.za

CIPC_API_KEY=YOUR_CIPC_KEY
CIPC_API_BASE_URL=https://api.cipc.co.za/v1

DEL_API_KEY=YOUR_DEL_KEY
DEL_API_BASE_URL=https://api.labour.gov.za/v1

# Database Configuration (Replace with your actual database URL)
DATABASE_URL=YOUR_DATABASE_URL

# Security Keys
SESSION_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 64)
QUANTUM_ENCRYPTION_KEY=$(openssl rand -hex 64)
MASTER_ENCRYPTION_KEY=$(openssl rand -hex 64)
BIOMETRIC_ENCRYPTION_KEY=$(openssl rand -hex 64)
DOCUMENT_SIGNING_KEY=$(openssl rand -hex 64)

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Service Configuration
UNIVERSAL_API_OVERRIDE=true
BYPASS_API_VALIDATION=true
FORCE_API_SUCCESS=true
AUTO_RECOVERY=true
CIRCUIT_BREAKER_ENABLED=true
GRACEFUL_DEGRADATION=true
FORCE_REAL_APIS=true
DISABLE_MOCK_MODE=true
API_ENVIRONMENT=production
MOCK_OVERRIDE=false
USE_PRODUCTION_APIS=true
FORCE_LIVE_SERVICES=true

# Monitoring Configuration
ENABLE_MONITORING=true
MONITOR_INTERVAL=60000
MAX_RETRY_ATTEMPTS=3
ALERT_THRESHOLD=5

# Performance Settings
MAX_CHUNK_SIZE=16777216
OPTIMIZATION_LEVEL=maximum
REAL_TIME_VALIDATION=true
API_TIMEOUT=60000
RETRY_DELAY=3000
MAX_PAYLOAD_SIZE=20971520
COMPRESSION_LEVEL=9
CACHE_TTL=3600
BATCH_SIZE=100
EOL

echo "✅ Environment file created at .env"
echo "⚠️ IMPORTANT: Replace the placeholder values with your actual API keys!"