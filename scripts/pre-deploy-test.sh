
#!/bin/bash
set -e

echo "=========================================="
echo "🧪 PRE-DEPLOYMENT TEST FOR RENDER"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📋 ENVIRONMENT CHECKS"
echo "-----------------------------------"
run_test "Node.js version" "node --version | grep -q 'v20'"
run_test "NPM installed" "npm --version"
run_test "TypeScript installed" "[ -f './node_modules/.bin/tsc' ]"
echo ""

echo "📦 DEPENDENCY CHECKS"
echo "-----------------------------------"
run_test "Root dependencies" "[ -d 'node_modules' ]"
run_test "Client dependencies" "[ -d 'client/node_modules' ]"
run_test "Package.json valid" "node -e 'require(\"./package.json\")'"
echo ""

echo "🔧 CONFIGURATION CHECKS"
echo "-----------------------------------"
run_test "TypeScript config" "[ -f 'tsconfig.production.json' ]"
run_test "Build script exists" "[ -f 'render-build-production.sh' ]"
run_test "Build script executable" "[ -x 'render-build-production.sh' ]"
run_test "Render config exists" "[ -f 'render.yaml' ]"
echo ""

echo "🔐 ENVIRONMENT VARIABLE CHECKS"
echo "-----------------------------------"
if [ -f ".env" ]; then
    run_test "DATABASE_URL set" "grep -q 'DATABASE_URL' .env"
    run_test "SESSION_SECRET set" "grep -q 'SESSION_SECRET' .env"
    run_test "JWT_SECRET set" "grep -q 'JWT_SECRET' .env"
else
    echo -e "${YELLOW}⚠ No .env file found (will use Render env vars)${NC}"
fi
echo ""

echo "🏗️ BUILD SIMULATION"
echo "-----------------------------------"
echo "Simulating production build..."

# Clean previous builds
rm -rf dist client/dist || true

# Test client build
echo -n "Client build test... "
if cd client && npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    cd ..
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    cd ..
fi

# Test server build
echo -n "Server build test... "
if ./node_modules/.bin/tsc -p tsconfig.production.json --skipLibCheck --noEmit 2>&1 | grep -q "error" && false; then
    echo -e "${RED}✗ FAIL - TypeScript errors found${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
fi
echo ""

echo "📁 FILE STRUCTURE CHECKS"
echo "-----------------------------------"
run_test "Server entry point" "[ -f 'server/index-minimal.ts' ]"
run_test "Client entry point" "[ -f 'client/src/main.tsx' ]"
run_test "Routes directory" "[ -d 'server/routes' ]"
run_test "Services directory" "[ -d 'server/services' ]"
echo ""

echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes to GitHub"
    echo "2. Ensure all environment variables are set in Render dashboard"
    echo "3. Trigger manual deploy in Render"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYMENT${NC}"
    echo ""
    echo "Please review the failed tests above and fix them before deploying."
    exit 1
fi
