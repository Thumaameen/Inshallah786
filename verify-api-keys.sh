#!/bin/bash

echo "🚀 DHA Digital Services - API Key Verification"
echo "========================================"

# Function to check required API keys
check_api_key() {
    key_name=$1
    if [[ -z "${!key_name}" ]]; then
        echo "❌ $key_name is not set"
        return 1
    else
        echo "✅ $key_name is configured"
        return 0
    }
}

# Core AI Services
echo -e "\n📡 Core AI Services:"
check_api_key "OPENAI_API_KEY"
check_api_key "ANTHROPIC_API_KEY"
check_api_key "MISTRAL_API_KEY"
check_api_key "GEMINI_API_KEY"
check_api_key "PERPLEXITY_API_KEY"

# Government Services
echo -e "\n🏛️ Government Services:"
check_api_key "DHA_NPR_API_KEY"
check_api_key "DHA_ABIS_API_KEY"
check_api_key "SAPS_CRC_API_KEY"
check_api_key "ICAO_PKD_API_KEY"
check_api_key "SITA_API_KEY"
check_api_key "CIPC_API_KEY"
check_api_key "DEL_API_KEY"

# Security Keys
echo -e "\n🔐 Security Keys:"
check_api_key "SESSION_SECRET"
check_api_key "JWT_SECRET"
check_api_key "ENCRYPTION_KEY"
check_api_key "QUANTUM_ENCRYPTION_KEY"

echo -e "\n📝 Instructions for Render:"
echo "1. Go to Render Dashboard → ultra-queen-ai-raeesa → Environment"
echo "2. Add any missing API keys"
echo "3. Make sure Node.js version is set to 20.19.1"
echo "4. Make sure npm version is set to 10.2.3"
echo "5. Verify build command is: bash render-build-production.sh"
echo "6. Verify start command is: node dist/server/index-minimal.js"

echo -e "\n💡 Build Settings (DO NOT CHANGE):"
echo "Node Version: 20.19.1"
echo "NPM Version: 10.2.3"
echo "Build Command: bash render-build-production.sh"
echo "Start Command: node dist/server/index-minimal.js"