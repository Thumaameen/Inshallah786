#!/bin/bash

# Exit on error
set -e

echo "=== Starting Clean Build Process ==="

# 1. Environment Setup
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Clean Installation
echo "Cleaning previous installation..."
rm -rf node_modules package-lock.json dist
mkdir -p dist

# 3. Install Core Dependencies
echo "Installing core dependencies..."
npm install --no-package-lock --legacy-peer-deps \
    vite@latest \
    @vitejs/plugin-react@latest \
    typescript@latest \
    @types/node@latest \
    @types/react@latest \
    @types/react-dom@latest \
    cross-env@latest \
    terser@latest

# 4. Install Project Dependencies
echo "Installing project dependencies..."
npm install --no-package-lock --legacy-peer-deps

# 5. Type Check
echo "Running type check..."
npm run type-check

# 6. Production Build
echo "Building for production..."
NODE_ENV=production npm run build

# 7. Verify Build
echo "Verifying build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi