#!/bin/bash

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking API Keys and Endpoints..."
echo "====================================="

# Function to check if a key exists in .env
check_key() {
    local key=$1
    local value=$(grep "^$key=" .env | cut -d '=' -f2)
    if [[ -z "$value" || "$value" == "YOUR_"* ]]; then
        echo -e "${RED}❌ $key not configured${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $key configured${NC}"
        return 0
    }
}

# Check Core AI Keys
echo -e "\n${YELLOW}Core AI Services:${NC}"
check_key "OPENAI_API_KEY"
check_key "ANTHROPIC_API_KEY"
check_key "MISTRAL_API_KEY"
check_key "GEMINI_API_KEY"
check_key "PERPLEXITY_API_KEY"

# Check Government API Keys
echo -e "\n${YELLOW}Government Services:${NC}"
check_key "DHA_NPR_API_KEY"
check_key "DHA_ABIS_API_KEY"
check_key "SAPS_CRC_API_KEY"
check_key "ICAO_PKD_API_KEY"
check_key "SITA_API_KEY"
check_key "CIPC_API_KEY"
check_key "DEL_API_KEY"

# Check Critical Infrastructure Keys
echo -e "\n${YELLOW}Infrastructure:${NC}"
check_key "DATABASE_URL"
check_key "SESSION_SECRET"
check_key "JWT_SECRET"
check_key "ENCRYPTION_KEY"
check_key "QUANTUM_ENCRYPTION_KEY"

# Check Blockchain Configuration
echo -e "\n${YELLOW}Blockchain Configuration:${NC}"
check_key "ETHEREUM_RPC_URL"
check_key "POLYGON_RPC_URL"
check_key "SOLANA_RPC_URL"

# Validate Endpoint URLs
echo -e "\n${YELLOW}Validating API Endpoints:${NC}"
curl -s -o /dev/null -w "%{http_code}" "https://api.openai.com/v1/models" > /dev/null && echo -e "${GREEN}✅ OpenAI API endpoint responding${NC}" || echo -e "${RED}❌ OpenAI API endpoint not responding${NC}"
curl -s -o /dev/null -w "%{http_code}" "https://api.anthropic.com/v1/messages" > /dev/null && echo -e "${GREEN}✅ Anthropic API endpoint responding${NC}" || echo -e "${RED}❌ Anthropic API endpoint not responding${NC}"
curl -s -o /dev/null -w "%{http_code}" "https://api.mistral.ai/v1/models" > /dev/null && echo -e "${GREEN}✅ Mistral AI endpoint responding${NC}" || echo -e "${RED}❌ Mistral AI endpoint not responding${NC}"

echo -e "\n${YELLOW}Summary:${NC}"
echo "=============="
echo "1. Replace any missing API keys in .env"
echo "2. Ensure all endpoints are accessible"
echo "3. Run 'npm run test:render' to verify the full system"
echo "4. Check 'npm run test:all' for comprehensive testing"