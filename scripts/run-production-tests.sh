#!/bin/bash

# Compile TypeScript
echo "🔨 Building TypeScript..."
npx tsc -p tsconfig.production.json

# Run production tests
echo "🧪 Running production tests..."
NODE_ENV=production node dist/test-production.js