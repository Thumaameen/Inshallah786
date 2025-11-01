
#!/bin/bash

# Add all API keys to Replit Secrets
# Replace the values with your actual API keys

# AI Provider Keys
echo "Adding AI Provider Keys..."
echo "OPENAI_API_KEY=your-openai-key-here" >> .env
echo "ANTHROPIC_API_KEY=your-anthropic-key-here" >> .env
echo "GOOGLE_API_KEY=your-google-key-here" >> .env
echo "GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key-here" >> .env
echo "MISTRAL_API_KEY=your-mistral-key-here" >> .env
echo "PERPLEXITY_API_KEY=your-perplexity-key-here" >> .env

# Government Integration Keys
echo "Adding Government Integration Keys..."
echo "DHA_NPR_API_KEY=your-dha-npr-key-here" >> .env
echo "DHA_NPR_SECRET=your-dha-npr-secret-here" >> .env
echo "DHA_NPR_BASE_URL=https://api.dha.gov.za/npr" >> .env
echo "DHA_ABIS_API_KEY=your-dha-abis-key-here" >> .env
echo "DHA_ABIS_SECRET=your-dha-abis-secret-here" >> .env
echo "DHA_ABIS_BASE_URL=https://abis.dha.gov.za/api" >> .env
echo "DHA_DMS_API_KEY=your-dha-dms-key-here" >> .env
echo "DHA_DMS_SECRET=your-dha-dms-secret-here" >> .env
echo "SAPS_CRC_API_KEY=your-saps-crc-key-here" >> .env
echo "SAPS_CRC_BASE_URL=https://saps.gov.za/api/crc" >> .env
echo "ICAO_PKD_API_KEY=your-icao-pkd-key-here" >> .env
echo "ICAO_PKD_SECRET=your-icao-pkd-secret-here" >> .env
echo "ICAO_PKD_BASE_URL=https://pkd.icao.int/api" >> .env

# Security & Encryption Keys
echo "Adding Security & Encryption Keys..."
echo "SECURITY_OVERRIDE_TOKEN=queen-raeesa-unlimited-access" >> .env
echo "DOC_PKI_PRIVATE_KEY=your-pki-private-key-here" >> .env
echo "DOC_ENCRYPTION_KEY=your-doc-encryption-key-here" >> .env
echo "AUDIT_ENCRYPTION_KEY=your-audit-encryption-key-here" >> .env
echo "ENCRYPTION_KEY=your-encryption-key-here" >> .env
echo "VITE_ENCRYPTION_KEY=your-vite-encryption-key-here" >> .env
echo "MASTER_ENCRYPTION_KEY=your-master-encryption-key-here" >> .env
echo "QUANTUM_ENCRYPTION_KEY=your-quantum-encryption-key-here" >> .env

# Other Integration Keys
echo "Adding Other Integration Keys..."
echo "ULTRA_AI_KEYS=your-ultra-ai-keys-here" >> .env
echo "SECURITY_WEBHOOK_URL=your-security-webhook-url-here" >> .env
echo "SECURITY_ALERT_KEY=your-security-alert-key-here" >> .env
echo "ABIS_ENDPOINT=https://abis.dha.gov.za/api/validate" >> .env
echo "SAPS_ENDPOINT=https://saps.gov.za/api/verify" >> .env
echo "DHA_ENDPOINT=https://dha.gov.za/api/status" >> .env

echo "✅ All environment variables added to .env file"
echo "⚠️  Remember to add these to Replit Secrets via the Secrets tool"
echo "⚠️  Then delete this script and the .env file for security"
