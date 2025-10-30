#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to verify npm package exists
verify_package() {
  if ! npm list "$1" >/dev/null 2>&1; then
    echo "❌ Missing required package: $1"
    return 1
  fi
  return 0
}

echo "🔍 Verifying build requirements..."

# Check Node.js
if ! command_exists node; then
  echo "❌ Node.js is not installed"
  exit 1
fi

# Check npm
if ! command_exists npm; then
  echo "❌ npm is not installed"
  exit 1
fi

# Verify Node version
NODE_VERSION=$(node -v)
if [[ ! "$NODE_VERSION" =~ ^v20 ]]; then
  echo "❌ Node.js version 20.x is required, found: $NODE_VERSION"
  exit 1
fi

# Check for required files
REQUIRED_FILES=(
  "package.json"
  "tsconfig.json"
  "client/package.json"
  "client/tsconfig.json"
  "render-build-production.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing required file: $file"
    exit 1
  fi
done

# Verify build directories exist
REQUIRED_DIRS=(
  "client/src"
  "server"
  "shared"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ Missing required directory: $dir"
    exit 1
  fi
done

# Check package.json scripts
REQUIRED_SCRIPTS=(
  "build"
  "build:server"
  "build:client"
  "start"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if ! grep -q "\"$script\":" package.json; then
    echo "❌ Missing required script in package.json: $script"
    exit 1
  fi
done

echo "✅ Build requirements verified successfully!"
exit 0