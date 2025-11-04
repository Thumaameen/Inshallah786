
#!/bin/bash
set -e

echo "🚀 Starting DHA Digital Services Platform"
echo "========================================"

# Verify build
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build not found!"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Client build not found!"
  exit 1
fi

# Set production environment
export NODE_ENV=production
export NODE_OPTIONS="--experimental-modules --es-module-specifier-resolution=node"
export PORT=${PORT:-10000}
export HOST=0.0.0.0

echo "✅ All pre-flight checks passed"
echo "✅ Starting server on ${HOST}:${PORT}..."
echo ""

# Start the server with production environment
exec node dist/server/index-minimal.js
