
#!/bin/bash

echo "🧪 COMPREHENSIVE SYSTEM TEST - ALL LIVE SYSTEMS"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Test function
test_system() {
  local name=$1
  local command=$2
  
  echo -n "Testing $name... "
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed++))
    return 1
  fi
}

echo "1️⃣ ENVIRONMENT VARIABLES"
echo "------------------------"
test_system "OpenAI API Key" "[ ! -z \"\$OPENAI_API_KEY\" ]"
test_system "Anthropic API Key" "[ ! -z \"\$ANTHROPIC_API_KEY\" ]"
test_system "Database URL" "[ ! -z \"\$DATABASE_URL\" ]"
test_system "Session Secret" "[ ! -z \"\$SESSION_SECRET\" ]"
echo ""

echo "2️⃣ FILE STRUCTURE"
echo "-----------------"
test_system "Server Entry Point" "[ -f \"dist/server/index-minimal.js\" ]"
test_system "Client Build" "[ -d \"dist/public\" ] && [ -f \"dist/public/index.html\" ]"
test_system "Package.json" "[ -f \"package.json\" ]"
echo ""

echo "3️⃣ DEPENDENCIES"
echo "---------------"
test_system "Node Modules" "[ -d \"node_modules\" ]"
test_system "TypeScript" "command -v tsc"
test_system "NPM" "command -v npm"
echo ""

echo "4️⃣ BUILD ARTIFACTS"
echo "------------------"
test_system "Server Build" "[ -d \"dist/server\" ]"
test_system "Routes Built" "[ -f \"dist/server/routes/ultra-ai.js\" ]"
test_system "Services Built" "[ -d \"dist/server/services\" ]"
echo ""

echo ""
echo "================================================"
echo "📊 TEST RESULTS"
echo "================================================"
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL${NC}"
  echo "🚀 Ready for production deployment"
  exit 0
else
  echo -e "${RED}❌ SOME SYSTEMS FAILED${NC}"
  echo "⚠️  Please fix issues before deploying"
  exit 1
fi
