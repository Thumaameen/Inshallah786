# Render Environment Variables Configuration

This document lists all environment variables that should be configured in your Render deployment for the DHA Digital Services Platform to function optimally.

## Critical Security Keys (REQUIRED)

These keys are essential for production security. Without them, the system will use auto-generated keys which are not persistent across deployments.

```bash
# Encryption and Security
ENCRYPTION_KEY="your-secure-encryption-key-minimum-32-characters"
JWT_SECRET="your-jwt-secret-key-minimum-32-characters"
SESSION_SECRET="your-session-secret-key-minimum-32-characters"

# Document Processing Security
DOCUMENT_ENCRYPTION_KEY="your-document-encryption-key-minimum-32-characters"
BIOMETRIC_ENCRYPTION_KEY="your-biometric-encryption-key-minimum-32-characters"
DOCUMENT_SIGNING_KEY="your-document-signing-key-minimum-32-characters"
VITE_ENCRYPTION_KEY="your-vite-encryption-key-minimum-32-characters"
MASTER_ENCRYPTION_KEY="your-master-encryption-key-minimum-32-characters"
QUANTUM_ENCRYPTION_KEY="your-quantum-encryption-key-minimum-32-characters"
```

## Database Configuration (REQUIRED)

```bash
# PostgreSQL Database - Automatically provided by Render if you create a PostgreSQL database
DATABASE_URL="postgresql://user:password@host:port/database"
```

## AI Provider API Keys (Recommended)

Configure at least one AI provider for full AI functionality. The system will gracefully degrade if these are not configured.

```bash
# OpenAI (GPT-5)
OPENAI_API_KEY="sk-proj-..."

# Anthropic (Claude)
ANTHROPIC_API_KEY="sk-ant-..."

# Google Gemini AI
GOOGLE_AI_API_KEY="AIza..."
GEMINI_API_KEY="AIza..."
GOOGLE_GEMINI_API_KEY="AIza..."

# Mistral AI
MISTRAL_API_KEY="..."

# Perplexity AI
PERPLEXITY_API_KEY="pplx-..."

# XAI (Grok)
XAI_API_KEY="..."
```

## Blockchain RPC Endpoints (Optional)

For blockchain functionality (Polygon, Solana, Ethereum). Without these, blockchain features will be disabled.

```bash
# Ethereum
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
ETH_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"

# Polygon
POLYGON_RPC_URL="https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY"
POLYGON_RPC_ENDPOINT="https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY"
MATIC_RPC_URL="https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY"

# Solana
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_RPC="https://api.mainnet-beta.solana.com"
SOL_RPC_URL="https://api.mainnet-beta.solana.com"
```

## Cloud Platform API Keys (Optional)

For Azure, GCP, and other cloud integrations:

```bash
# Azure
AZURE_API_KEY="..."
AZURE_SUBSCRIPTION_ID="..."
AZURE_TENANT_ID="..."

# Google Cloud Platform
GCP_API_KEY="..."
GOOGLE_CLOUD_API_KEY="..."
GCP_PROJECT_ID="..."
```

## South African Government API Keys (Production Required)

These are required for real DHA, SAPS, and other government integrations in production:

```bash
# DHA National Population Register
DHA_NPR_API_KEY="..."
DHA_NPR_BASE_URL="https://npr-prod.dha.gov.za/api/v1"
DHA_NPR_KEY="..."
NPR_API_KEY="..."

# DHA Automated Biometric Identification System
DHA_ABIS_API_KEY="..."
DHA_ABIS_BASE_URL="https://abis-prod.dha.gov.za/api/v1"
DHA_ABIS_KEY="..."
ABIS_API_KEY="..."

# SAPS Criminal Record Centre
SAPS_CRC_API_KEY="..."
SAPS_CRC_BASE_URL="https://crc-api.saps.gov.za/v1"
SAPS_API_KEY="..."
SAPS_KEY="..."
CRC_API_KEY="..."

# ICAO Public Key Directory
ICAO_PKD_API_KEY="..."
ICAO_PKD_BASE_URL="..."
ICAO_API_KEY="..."
PKD_API_KEY="..."

# HANIS (Home Affairs National Identification System)
HANIS_API_KEY="..."
HANIS_SECRET_KEY="..."

# SITA (State Information Technology Agency)
SITA_API_KEY="..."
SITA_ESERVICES_API_KEY="..."
```

## mTLS Certificates (Production Required)

For secure government API communication:

```bash
# mTLS Certificate Paths
MTLS_CERT_PATH="/path/to/client-cert.pem"
MTLS_KEY_PATH="/path/to/client-key.pem"
MTLS_CA_PATH="/path/to/ca-cert.pem"
```

## Web Services (Optional)

```bash
# GitHub
GITHUB_TOKEN="ghp_..."

# Stripe (Payment Processing)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+..."

# SendGrid (Email)
SENDGRID_API_KEY="SG..."
```

## System Configuration

```bash
# Node Environment
NODE_ENV="production"

# Port Configuration (Render sets this automatically)
PORT="10000"

# Render Detection (Render sets this automatically)
RENDER="true"
RENDER_SERVICE_ID="..."

# Optional Feature Flags
REQUIRE_DATABASE_URL="false"  # Set to "true" to make database mandatory
PREVIEW_MODE="false"
```

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Select your web service
3. Navigate to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable with its value
6. Click "Save Changes"
7. Render will automatically redeploy with the new variables

## Security Best Practices

1. **Never commit** these values to your repository
2. **Use strong, randomly generated** keys for all encryption and security variables
3. **Rotate keys regularly** (every 90 days recommended)
4. **Monitor access logs** for any unauthorized API usage
5. **Keep API keys** in Render's secure environment variables (they're encrypted at rest)
6. **Use different keys** for development and production

## Generating Secure Random Keys

You can generate secure random keys using Node.js:

```bash
# Generate a 32-character random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a 64-character random key
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Minimum Required Configuration

For the platform to work at a basic level, you **must** configure:

1. `DATABASE_URL` (can be auto-configured via Render PostgreSQL)
2. `SESSION_SECRET`
3. `JWT_SECRET`
4. `ENCRYPTION_KEY`
5. At least one AI provider key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)

## Feature-Specific Requirements

### For Full AI Functionality
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`

### For Blockchain Features
- `POLYGON_RPC_URL`
- `SOLANA_RPC_URL`
- `ETHEREUM_RPC_URL`

### For Government Document Processing
- `DHA_NPR_API_KEY`
- `DHA_ABIS_API_KEY`
- `SAPS_CRC_API_KEY`
- `DOCUMENT_ENCRYPTION_KEY`

### For Biometric Processing
- `DHA_ABIS_API_KEY`
- `BIOMETRIC_ENCRYPTION_KEY`

## Troubleshooting

### Server won't start
- Check that `NODE_ENV` is set to `production`
- Verify `DATABASE_URL` is configured (or set `REQUIRE_DATABASE_URL=false`)

### AI features not working
- Verify at least one AI provider API key is configured
- Check Render logs for "API key not configured" warnings

### Blockchain features disabled
- Configure at least one blockchain RPC endpoint
- Ensure RPC URLs don't contain placeholder values like "YOUR_KEY"

### Government API errors
- Ensure you have valid credentials from the respective government agencies
- Verify API endpoints are correct for production environment
- Check that mTLS certificates are properly configured if required
