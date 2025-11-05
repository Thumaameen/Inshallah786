#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔑 API Key Configuration Helper"
echo "=============================="

# Function to check if an environment variable exists in Render config
check_env_var() {
    local var_name=$1
    if grep -q "^$var_name=" ".env.production" 2>/dev/null; then
        echo -e "${GREEN}✓ $var_name is configured${NC}"
        return 0
    else
        echo -e "${RED}✗ $var_name needs to be configured in Render${NC}"
        return 1
    }
}

# Create or update .env.production
touch .env.production

# Core API Keys
echo "📋 Checking Core AI API Keys..."
check_env_var "OPENAI_API_KEY"
check_env_var "ANTHROPIC_API_KEY"
check_env_var "MISTRAL_API_KEY"
check_env_var "GEMINI_API_KEY"
check_env_var "PERPLEXITY_API_KEY"

echo -e "\n📋 Checking Government API Keys..."
check_env_var "DHA_NPR_API_KEY"
check_env_var "DHA_ABIS_API_KEY"
check_env_var "SAPS_CRC_API_KEY"
check_env_var "ICAO_PKD_API_KEY"
check_env_var "SITA_API_KEY"
check_env_var "CIPC_API_KEY"
check_env_var "DEL_API_KEY"

echo -e "\n📋 Checking Security Keys..."
check_env_var "SESSION_SECRET"
check_env_var "JWT_SECRET"
check_env_var "ENCRYPTION_KEY"
check_env_var "QUANTUM_ENCRYPTION_KEY"

echo -e "\n📋 Instructions for Render Dashboard:"
echo "1. Go to: Dashboard → ultra-queen-ai-raeesa → Environment"
echo "2. Add any missing API keys"
echo "3. Click 'Save Changes' to apply"
echo "4. Render will automatically redeploy"

echo -e "\n✅ Configuration Helper Complete"