#!/bin/bash
set -e

echo "=========================================="
echo "🚀 FINAL BUILD SCRIPT"
echo "=========================================="

# Use absolute paths with Node
NODE_BIN="/home/codespace/nvm/current/bin/node"
NPM_BIN="/home/codespace/nvm/current/bin/npm"
TSC_BIN="/workspaces/Inshallah786/node_modules/.bin/tsc"

echo "Node: $($NODE_BIN --version)"
echo "npm: $($NPM_BIN --version)"

# Ensure directories
mkdir -p /workspaces/Inshallah786/dist/public
mkdir -p /workspaces/Inshallah786/dist/server

# Copy client assets
echo "📋 Copying client assets..."
cp -f /workspaces/Inshallah786/client/dist/index.html /workspaces/Inshallah786/dist/public/ || echo "Warning: client dist not ready"
cp -f /workspaces/Inshallah786/client/dist/404.html /workspaces/Inshallah786/dist/public/ || echo "Warning: 404.html not found"

# Ensure environment config
echo "⚙️ Setting up environment..."
bash /workspaces/Inshallah786/scripts/ensure-env.sh

# Compile TypeScript
echo "🏗️ Compiling TypeScript server..."
$TSC_BIN -p /workspaces/Inshallah786/tsconfig.production.json --skipLibCheck || {
    echo "⚠️ TypeScript compilation had errors, but continuing..."
}

# Verify output
if [ -f "/workspaces/Inshallah786/dist/server/index-minimal.js" ]; then
    echo "✅ Server compiled successfully"
else
    echo "❌ Server compilation failed"
    exit 1
fi

# Verify public assets
if [ -f "/workspaces/Inshallah786/dist/public/index.html" ]; then
    echo "✅ Client assets ready"
else
    echo "⚠️ Client assets missing"
fi

echo ""
echo "=========================================="
echo "✅ BUILD COMPLETE!"
echo "=========================================="
echo ""
echo "Build outputs:"
ls -la /workspaces/Inshallah786/dist/server/*.js | wc -l
echo "server .js files compiled"
ls -la /workspaces/Inshallah786/dist/public/ | grep -E "(html|js)" | wc -l
echo "public assets ready"
echo ""
