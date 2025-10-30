#!/bin/bash
set -e

echo "🚀 Starting DHA Digital Services Platform"
echo "========================================"

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-10000}
export HOST=0.0.0.0

# Start the server
echo "✅ Starting server on ${HOST}:${PORT}..."
node dist/server/index-minimal.js
