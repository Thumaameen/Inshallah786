#!/bin/bash

echo "🔐 DHA Key Validation Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "📦 Installing TypeScript..."
    npm install -g typescript
fi

# Install dependencies if needed
if [ ! -f "node_modules/cross-fetch/package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install cross-fetch @types/node typescript ts-node
fi

# Run the validation script
echo "🚀 Running key validation..."
ts-node scripts/validate-keys.ts