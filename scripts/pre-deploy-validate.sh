#!/bin/bash
set -e

echo "🔍 Running pre-deployment validation..."

# Check Node.js version
if [[ "$(node --version)" != *"v20.19.0"* ]]; then
    echo "❌ Incorrect Node.js version. Required: v20.19.0"
    exit 1
fi

# Check npm version
if [[ "$(npm --version)" != "10.5.0" ]]; then
    echo "❌ Incorrect npm version. Required: 10.5.0"
    exit 1
fi

# Check critical files
critical_files=(
    "package.json"
    "tsconfig.production.json"
    "client/package.json"
    "render.yaml"
    "render-build-production.sh"
    "server/index-minimal.ts"
    "server/routes/health.ts"
)

for file in "${critical_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing critical file: $file"
        exit 1
    fi
done

# Check for required environment variables
required_env=(
    "NODE_ENV"
    "NODE_VERSION"
    "NPM_VERSION"
    "PORT"
    "SESSION_SECRET"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
    "DATABASE_URL"
)

for env in "${required_env[@]}"; do
    if [[ -z "${!env}" ]]; then
        echo "❌ Missing required environment variable: $env"
        exit 1
    fi
done

# All checks passed
echo "✅ Pre-deployment validation passed"
exit 0