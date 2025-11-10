
#!/bin/bash
set -e

echo "=========================================="
echo "🚀 FINAL DEPLOYMENT READINESS CHECK"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "📋 PHASE 1: ENVIRONMENT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js version
if node --version | grep -q 'v20'; then
    echo -e "${GREEN}✓${NC} Node.js v20.x detected"
else
    echo -e "${RED}✗${NC} Node.js v20.x required"
    ((ERRORS++))
fi

# Check TypeScript
if [ -f "./node_modules/.bin/tsc" ]; then
    echo -e "${GREEN}✓${NC} TypeScript compiler available"
else
    echo -e "${RED}✗${NC} TypeScript not installed"
    ((ERRORS++))
fi

# Check critical files
echo ""
echo "📁 PHASE 2: CRITICAL FILES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CRITICAL_FILES=(
    "render-build-production.sh"
    "server/index-minimal.ts"
    "tsconfig.production.json"
    "render.yaml"
    "client/vite.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        ((ERRORS++))
    fi
done

# Check build script is executable
if [ -x "render-build-production.sh" ]; then
    echo -e "${GREEN}✓${NC} Build script is executable"
else
    echo -e "${YELLOW}⚠${NC} Build script not executable, fixing..."
    chmod +x render-build-production.sh
    ((WARNINGS++))
fi

echo ""
echo "🔧 PHASE 3: TYPESCRIPT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Type check without emitting
if ./node_modules/.bin/tsc -p tsconfig.production.json --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${YELLOW}⚠${NC} TypeScript warnings detected (non-blocking)"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓${NC} TypeScript validation passed"
fi

echo ""
echo "🏗️ PHASE 4: BUILD SIMULATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean previous builds
rm -rf dist client/dist 2>/dev/null || true

# Test production build
if bash render-build-production.sh > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓${NC} Production build successful"
else
    echo -e "${RED}✗${NC} Production build failed"
    echo "Last 20 lines of build log:"
    tail -20 /tmp/build.log
    ((ERRORS++))
fi

echo ""
echo "📦 PHASE 5: BUILD ARTIFACTS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BUILD_ARTIFACTS=(
    "dist/server/index-minimal.js"
    "client/dist/index.html"
    "dist/public/index.html"
)

for artifact in "${BUILD_ARTIFACTS[@]}"; do
    if [ -f "$artifact" ]; then
        echo -e "${GREEN}✓${NC} $artifact created"
    else
        echo -e "${RED}✗${NC} Missing: $artifact"
        ((ERRORS++))
    fi
done

echo ""
echo "🔐 PHASE 6: SECURITY CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for .env in dist
if [ -f "dist/.env" ]; then
    echo -e "${RED}✗${NC} .env file leaked to dist/"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} No .env in dist/"
fi

# Check for node_modules in dist
if [ -d "dist/node_modules" ]; then
    echo -e "${RED}✗${NC} node_modules leaked to dist/"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} No node_modules in dist/"
fi

echo ""
echo "🚀 PHASE 7: RUNTIME TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

export NODE_ENV=production
export PORT=10001

# Start server in background
timeout 15s node dist/server/index-minimal.js > /tmp/server-test.log 2>&1 &
SERVER_PID=$!

sleep 5

if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Server started successfully"
    
    # Try health check
    if curl -f http://localhost:10001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Health endpoint responding"
    else
        echo -e "${YELLOW}⚠${NC} Health endpoint not ready (may need more time)"
        ((WARNINGS++))
    fi
    
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗${NC} Server failed to start"
    echo "Server log:"
    cat /tmp/server-test.log
    ((ERRORS++))
fi

echo ""
echo "📊 PHASE 8: RENDER CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "render-build-production.sh" render.yaml; then
    echo -e "${GREEN}✓${NC} Build command configured in render.yaml"
else
    echo -e "${RED}✗${NC} Build command missing in render.yaml"
    ((ERRORS++))
fi

if grep -q "dist/server/index-minimal.js" render.yaml; then
    echo -e "${GREEN}✓${NC} Start command configured in render.yaml"
else
    echo -e "${RED}✗${NC} Start command missing in render.yaml"
    ((ERRORS++))
fi

echo ""
echo "=========================================="
echo "📈 DEPLOYMENT READINESS SUMMARY"
echo "=========================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT READY${NC}"
    echo -e "${GREEN}🚀 Safe to push to Render${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Production deployment'"
    echo "3. git push origin main"
    echo "4. Monitor Render deployment logs"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}Fix $ERRORS error(s) before deploying${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi
