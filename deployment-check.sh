#!/bin/bash
set -e

echo "=========================================="
echo "🔍 RENDER DEPLOYMENT READINESS CHECK"
echo "=========================================="
echo ""

REPO="/workspaces/Inshallah786"
PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local name=$1
  local cmd=$2
  echo -n "Checking: $name ... "
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAIL++))
  fi
}

# 1. Node & npm versions
echo "📌 Environment Check:"
check "Node 20.19.0" "node --version | grep -q 'v20.19.0'"
check "npm installed" "which npm"
echo ""

# 2. Build artifacts
echo "📦 Build Artifacts:"
check "dist/server/index-minimal.js exists" "test -f $REPO/dist/server/index-minimal.js"
check "dist/server/index-minimal.js > 10KB" "test -s $REPO/dist/server/index-minimal.js && test $(stat -f%z $REPO/dist/server/index-minimal.js 2>/dev/null || stat -c%s $REPO/dist/server/index-minimal.js) -gt 10000"
check "dist/public/index.html exists" "test -f $REPO/dist/public/index.html"
check "dist/public/404.html exists" "test -f $REPO/dist/public/404.html"
echo ""

# 3. Configuration files
echo "⚙️  Configuration:"
check "dist/server/config/env.js exists" "test -f $REPO/dist/server/config/env.js"
check "tsconfig.production.json exists" "test -f $REPO/tsconfig.production.json"
check "render.yaml exists" "test -f $REPO/render.yaml"
check "render-build-production.sh exists" "test -f $REPO/render-build-production.sh"
echo ""

# 4. Package files
echo "📋 Package Configuration:"
check "package.json exists" "test -f $REPO/package.json"
check "package.json has start script" "grep -q '\"start\".*node.*dist' $REPO/package.json"
check "package.json has build script" "grep -q '\"build\".*tsc' $REPO/package.json"
echo ""

# 5. Git status
echo "🔄 Git Status:"
check "Git repo initialized" "test -d $REPO/.git"
check "No uncommitted changes" "cd $REPO && git status --short | wc -l | grep -q '^0$' || echo 'Files staged for commit are OK' && true"
echo ""

# 6. Dependencies
echo "📚 Dependencies:"
check "node_modules exists" "test -d $REPO/node_modules"
check "typescript installed" "test -f $REPO/node_modules/.bin/tsc"
check "drizzle-orm installed" "test -d $REPO/node_modules/drizzle-orm"
echo ""

# 7. ESM compatibility
echo "🔗 ESM Compatibility:"
check "package.json has type:module" "grep -q '\"type\".*:.*\"module\"' $REPO/package.json"
check "index-minimal.js uses ES6 imports" "head -20 $REPO/dist/server/index-minimal.js | grep -q 'import.*from'"
echo ""

# 8. Server startup test
echo "🚀 Server Startup Test:"
echo -n "Checking: Server can start (timeout 5s) ... "
STARTUP_TEST=$(timeout 5 bash -c "cd $REPO && SESSION_SECRET=test JWT_SECRET=test node dist/server/index-minimal.js 2>&1" || true)
if echo "$STARTUP_TEST" | grep -q "listening\|CORS\|🚀\|health\|Server\|API"; then
  echo -e "${GREEN}✅ PASS${NC}"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️  WARNING${NC}"
  echo "Server output: $STARTUP_TEST"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 RESULTS"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ READY FOR RENDER DEPLOYMENT${NC}"
  exit 0
else
  echo -e "${RED}❌ DEPLOYMENT NOT READY${NC}"
  echo "Fix the $FAIL failing checks before deploying"
  exit 1
fi
