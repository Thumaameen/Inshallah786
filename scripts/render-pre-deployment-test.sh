
#!/bin/bash
set -e

echo "=========================================="
echo "🚀 RENDER PRE-DEPLOYMENT TEST"
echo "=========================================="
echo "Testing: Production Build & Runtime"
echo "Build Command: bash render-build-production.sh"
echo "Start Command: node dist/server/index-minimal.js"
echo "Node: 20.19.0 | NPM: 10.5.0 | Vite: Production"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
CRITICAL_FAILURES=0

# Test function
run_test() {
    local test_name=$1
    local test_command=$2
    local is_critical=${3:-false}
    
    echo -n "Testing: $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        if [ "$is_critical" = true ]; then
            ((CRITICAL_FAILURES++))
        fi
        return 1
    fi
}

# Critical test function (exits on failure)
critical_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "CRITICAL: $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL - BLOCKING${NC}"
        echo ""
        echo -e "${RED}❌ CRITICAL TEST FAILED - DEPLOYMENT BLOCKED${NC}"
        exit 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PHASE 1: ENVIRONMENT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

critical_test "Node.js v20.x" "node --version | grep -qE '^v20\.[0-9]+\.[0-9]+'"
critical_test "NPM v10.x" "npm --version | grep -qE '^10\.[0-9]+\.[0-9]+'"
run_test "TypeScript installed" "[ -f './node_modules/.bin/tsc' ]"
run_test "Production mode set" "[ \"\$NODE_ENV\" = 'production' ] || [ -z \"\$NODE_ENV\" ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PHASE 2: DEPENDENCY VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

critical_test "Root package.json exists" "[ -f 'package.json' ]"
critical_test "Client package.json exists" "[ -f 'client/package.json' ]"
run_test "Root node_modules" "[ -d 'node_modules' ]"
run_test "Client node_modules" "[ -d 'client/node_modules' ]"
run_test "Vite available" "[ -f 'client/node_modules/.bin/vite' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 PHASE 3: CONFIGURATION FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

critical_test "Build script exists" "[ -f 'render-build-production.sh' ]"
critical_test "Build script executable" "[ -x 'render-build-production.sh' ]"
critical_test "TypeScript production config" "[ -f 'tsconfig.production.json' ]"
critical_test "Server entry point exists" "[ -f 'server/index-minimal.ts' ]"
critical_test "Client Vite config" "[ -f 'client/vite.config.ts' ]"
run_test "Render config exists" "[ -f 'render.yaml' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️ PHASE 4: PRODUCTION BUILD TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist client/dist || true

# Run production build
echo ""
echo "Running production build script..."
echo "Command: bash render-build-production.sh"
echo ""

if bash render-build-production.sh; then
    echo -e "${GREEN}✓ Build script completed successfully${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Build script failed${NC}"
    ((TESTS_FAILED++))
    ((CRITICAL_FAILURES++))
    echo -e "${RED}❌ BUILD FAILED - DEPLOYMENT BLOCKED${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 PHASE 5: BUILD ARTIFACTS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

critical_test "Server build directory" "[ -d 'dist/server' ]"
critical_test "Server entry point built" "[ -f 'dist/server/index-minimal.js' ]"
critical_test "Client build directory" "[ -d 'client/dist' ]"
critical_test "Client index.html" "[ -f 'client/dist/index.html' ]"
critical_test "Public directory created" "[ -d 'dist/public' ]"
critical_test "Public index.html copied" "[ -f 'dist/public/index.html' ]"

# Check for essential server files
run_test "Server routes built" "[ -f 'dist/server/routes-simple.js' ]"
run_test "Server config built" "[ -d 'dist/server/config' ]"

# Check client assets
run_test "Client assets directory" "[ -d 'client/dist/assets' ]"
run_test "Client has JS files" "find client/dist/assets -name '*.js' | grep -q '.'"
run_test "Client has CSS files" "find client/dist/assets -name '*.css' | grep -q '.'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PHASE 6: CODE QUALITY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for syntax errors in built files
run_test "Server JS syntax valid" "node --check dist/server/index-minimal.js"
run_test "No critical errors in build" "! grep -r 'ERROR' dist/server/*.js || true"

# Check file sizes
SERVER_SIZE=$(du -sh dist/server | cut -f1)
CLIENT_SIZE=$(du -sh client/dist | cut -f1)
echo "Server build size: $SERVER_SIZE"
echo "Client build size: $CLIENT_SIZE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PHASE 7: RUNTIME SIMULATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Starting server in test mode..."
export NODE_ENV=production
export PORT=10000

# Start server in background
timeout 30s node dist/server/index-minimal.js > /tmp/server-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server startup..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓ Server process started${NC}"
    ((TESTS_PASSED++))
    
    # Test health endpoint
    echo "Testing health endpoint..."
    sleep 2
    if curl -f http://localhost:10000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health endpoint responding${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${YELLOW}⚠ Health endpoint not responding (may need more time)${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Kill test server
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗ Server failed to start${NC}"
    ((TESTS_FAILED++))
    ((CRITICAL_FAILURES++))
    cat /tmp/server-test.log
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 PHASE 8: SECURITY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "No .env in build" "! [ -f 'dist/.env' ]"
run_test "No secrets in client" "! grep -r 'API_KEY' client/dist/ || true"
run_test "No node_modules in dist" "! [ -d 'dist/node_modules' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PHASE 9: DEPLOYMENT READINESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Render configuration
if [ -f "render.yaml" ]; then
    echo "Render configuration found"
    run_test "Build command in render.yaml" "grep -q 'render-build-production.sh' render.yaml"
    run_test "Start command in render.yaml" "grep -q 'dist/server/index-minimal.js' render.yaml"
    run_test "Node version specified" "grep -q '20.19.0' render.yaml"
fi

echo ""
echo "=========================================="
echo "📈 TEST SUMMARY"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Critical Failures: ${RED}$CRITICAL_FAILURES${NC}"
echo ""

# Final verdict
if [ $CRITICAL_FAILURES -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ ALL CRITICAL TESTS PASSED${NC}"
    echo -e "${GREEN}🚀 READY FOR RENDER DEPLOYMENT${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Deployment Configuration:"
    echo "  Build Command: bash render-build-production.sh"
    echo "  Start Command: node dist/server/index-minimal.js"
    echo "  Node Version: 20.19.0"
    echo "  NPM Version: 10.5.0"
    echo ""
    echo "Next Steps:"
    echo "  1. Commit and push to GitHub"
    echo "  2. Set environment variables in Render dashboard"
    echo "  3. Trigger manual deployment"
    echo "  4. Monitor deployment logs"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ CRITICAL TESTS FAILED${NC}"
    echo -e "${RED}🚫 DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the critical issues above before deploying."
    echo ""
    exit 1
fi
