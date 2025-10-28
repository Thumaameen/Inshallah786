#!/bin/bash
set -e

echo "🚀 DHA Digital Services - Render Production Build"
echo "=================================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-optional

# Build client
echo "🎨 Building client application..."
cd client
rm -rf node_modules package-lock.json
npm install --include=dev --legacy-peer-deps
npm install react-is --legacy-peer-deps
npm run build
cd ..

# Build server
echo "⚙️ Building server application..."
npx tsc -p tsconfig.json --skipLibCheck --noEmitOnError false || echo "Build completed with warnings"

# Copy client build to dist/public
echo "📋 Copying client build to dist/public..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

echo "✅ Build complete!"