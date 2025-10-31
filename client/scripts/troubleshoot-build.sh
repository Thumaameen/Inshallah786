#!/bin/bash

set -e

echo "=== Starting Build Troubleshooting ==="

# Step 1: Environment Check
echo "Step 1: Checking Environment"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Step 2: Clean Previous Build
echo -e "\nStep 2: Cleaning Previous Build"
rm -rf dist node_modules package-lock.json
echo "✓ Cleaned previous build files"

# Step 3: Install Dependencies
echo -e "\nStep 3: Installing Dependencies"
npm install --legacy-peer-deps
npm install -D terser cross-env @types/node typescript@latest vite@latest @vitejs/plugin-react@latest
echo "✓ Installed dependencies"

# Step 4: Type Checking
echo -e "\nStep 4: Type Checking"
npm run type-check
echo "✓ Type checking completed"

# Step 5: Production Build
echo -e "\nStep 5: Production Build"
NODE_ENV=production npm run build

# Step 6: Verify Build
echo -e "\nStep 6: Verifying Build"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✓ Build verified successfully"
    ls -la dist/
else
    echo "✗ Build verification failed"
    exit 1
fi

echo -e "\n=== Build Troubleshooting Completed ==="