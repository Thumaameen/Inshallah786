#!/bin/bash
set -e

echo "Starting client production build..."

# Navigate to client directory
cd client

# Clean install dependencies
echo "Installing dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build for production
echo "Building for production..."
NODE_ENV=production npm run build

# Check build directory
if [ ! -d "dist" ]; then
  echo "Error: Build failed - dist directory not created"
  exit 1
fi

echo "Client build completed successfully!"