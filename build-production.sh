#!/bin/bash

# Exit on error
set -e

echo "Starting production build process..."

# Install dependencies
echo "Installing root dependencies..."
npm install

# Build client
echo "Building client..."
cd client
npm install --include=dev
npm run build

# Move back to root
cd ..

# Build server
echo "Building server..."
npm run build:server

# Run production tests
echo "Running production tests..."
npm run test:production

# Verify build
echo "Verifying build..."
node verify-build.sh

echo "Build process completed successfully!"