#!/bin/bash

# Exit on error
set -e

echo "=== Starting Production Build Process ==="

# 1. Environment Check
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Clean Install
echo "Cleaning previous installation..."
rm -rf node_modules package-lock.json dist
echo "Installing dependencies..."
npm install --legacy-peer-deps

# 3. Type Check
echo "Running type check..."
npx tsc --noEmit

# 4. Production Build
echo "Building for production..."
NODE_ENV=production npm run build

# 5. Verify Build
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful! Contents of dist:"
    ls -la dist/
    
    # Check for crucial files
    if [ -d "dist/assets" ]; then
        echo "✅ Assets directory present"
    else
        echo "❌ Assets directory missing!"
        exit 1
    fi
    
    # Check .env.production
    if [ -f ".env.production" ]; then
        echo "✅ Production environment file present"
    else
        echo "❌ Missing .env.production file!"
        echo "Creating .env.production with default settings..."
        echo "VITE_API_URL=https://ultra-queen-ai-raeesa.onrender.com
VITE_ENV=production
VITE_ENABLE_MONITORING=true" > .env.production
    fi
else
    echo "❌ Build failed! dist/index.html not found"
    exit 1
fi

echo "=== Build Process Complete ==="