#!/bin/bash

# Production Environment Verification Script
echo "🔍 Verifying Production Environment"
echo "=================================="

# Check Node.js version
if [ "$(node -v)" != "v20.19.1" ]; then
    echo "❌ Error: Wrong Node.js version. Required: v20.19.1, Found: $(node -v)"
    exit 1
fi
echo "✅ Node.js version verified: $(node -v)"

# Verify index-minimal.js exists
if [ ! -f "dist/server/index-minimal.js" ]; then
    echo "❌ Error: dist/server/index-minimal.js not found"
    exit 1
fi
echo "✅ Server entry point verified"

# Verify client build
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Error: Client build not found"
    exit 1
fi
echo "✅ Client build verified"

# Try to start the server
echo "🚀 Testing server start..."
NODE_ENV=production \
NODE_OPTIONS='--experimental-modules --es-module-specifier-resolution=node' \
node -e "import('./dist/server/index-minimal.js')" &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Error: Server failed to start"
    exit 1
fi

# Kill the test server
kill $SERVER_PID

echo "✅ Server start test passed"
echo "✅ All production checks passed!"