
# 🚀 DHA Digital Services - Production Setup Guide

## Required Environment Variables

### Core Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### AI Provider Keys (15/22 currently configured)
```bash
# Configured ✅
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
PERPLEXITY_API_KEY=...

# Missing - Add These ❌
GEMINI_API_KEY=...
XAI_API_KEY=...
```

### Government APIs (Configure for Real Data)
```bash
# DHA National Population Register
DHA_NPR_API_KEY=your_key_here
DHA_NPR_ENDPOINT=https://npr-prod.dha.gov.za/api/v1

# DHA Automated Biometric Identification System
DHA_ABIS_API_KEY=your_key_here
DHA_ABIS_ENDPOINT=https://abis-prod.dha.gov.za/api/v1

# SAPS Criminal Record Centre
SAPS_CRC_API_KEY=your_key_here
SAPS_CRC_ENDPOINT=https://crc-api.saps.gov.za/v1

# ICAO Public Key Directory
ICAO_PKD_API_KEY=your_key_here
ICAO_PKD_ENDPOINT=https://pkd.icao.int/api/v1

# HANIS - Home Affairs National Identification System
HANIS_API_KEY=your_key_here

# SITA eServices
SITA_ESERVICES_API_KEY=your_key_here
```

### Blockchain (Optional)
```bash
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/...
POLYGON_RPC_ENDPOINT=https://polygon-rpc.com
```

### Security Keys
```bash
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## Setup Instructions

### On Render.com:

1. Go to your service dashboard
2. Click "Environment" tab
3. Add each variable one by one
4. Click "Save Changes"
5. Render will auto-deploy with new variables

### Testing After Setup:

1. Visit: https://dha-thisone.onrender.com/api/health
2. Check all services show "✅ Configured"
3. Test AI Chat: https://dha-thisone.onrender.com/ai-assistant
4. Test Document Generation: https://dha-thisone.onrender.com/documents

## Troubleshooting

### AI Chat Not Working
- Verify OPENAI_API_KEY or ANTHROPIC_API_KEY is set
- Check API key has credits/quota
- View logs: `Render Dashboard > Logs`

### Documents Not Generating
- Ensure at least one AI provider key is configured
- Check document type is supported (23 types available)
- Verify user permissions

### No Downloads Appearing
- Generated PDFs are sent directly to browser
- Check browser's download folder
- Look for "Content-Disposition: attachment" header

### Database Errors
- Verify DATABASE_URL is correctly formatted
- Ensure PostgreSQL is accessible from Render
- Check database has required tables (run migrations)
