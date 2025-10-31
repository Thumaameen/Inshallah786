#!/bin/bash
set -e

echo "🚀 Starting complete build process..."

# 1. Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json dist

# 2. Install core dependencies first
echo "📦 Installing core build dependencies..."
npm install --no-package-lock \
    vite@4.5.0 \
    @vitejs/plugin-react@4.0.0 \
    typescript@4.9.5 \
    @types/node@18.15.0 \
    @types/react@18.0.28 \
    @types/react-dom@18.0.11

# 3. Install project dependencies
echo "📦 Installing project dependencies..."
npm install --legacy-peer-deps

# 4. Build the project
echo "🛠 Building project..."
NODE_ENV=production npm run build

echo "✅ Build completed successfully!"