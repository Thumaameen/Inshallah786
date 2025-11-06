#!/bin/bash
set -e

echo "🔍 Running Pre-Deployment Tests"
echo "=============================="
echo "Started: $(date)"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_var() {
    local var_name="$1"
    if [ -z "${!var_name}" ]; then
        echo "❌ Missing environment variable: $var_name"
        return 1
    else
        echo "✅ Environment variable present: $var_name"
        return 0
    fi
}

# 1. Check system requirements
echo "📋 Checking system requirements..."
REQUIRED_COMMANDS=(
    "node"
    "npm"
    "git"
)

for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if command_exists "$cmd"; then
        echo "✅ $cmd is installed"
    else
        echo "❌ $cmd is not installed"
        exit 1
    fi
done

# 2. Verify Node.js version
echo -e "\n📦 Checking Node.js version..."
REQUIRED_NODE="20.19.1"
CURRENT_NODE=$(node -v | sed 's/v//')

if [[ "$CURRENT_NODE" == "$REQUIRED_NODE" ]]; then
    echo "✅ Node.js version is correct: $CURRENT_NODE"
else
    echo "❌ Node.js version mismatch. Required: $REQUIRED_NODE, Found: $CURRENT_NODE"
    exit 1
fi

# 3. Check npm version
echo -e "\n📦 Checking npm version..."
REQUIRED_NPM="10.2.3"
CURRENT_NPM=$(npm -v)

if [[ "$CURRENT_NPM" == "$REQUIRED_NPM" ]]; then
    echo "✅ npm version is correct: $CURRENT_NPM"
else
    echo "❌ npm version mismatch. Required: $REQUIRED_NPM, Found: $CURRENT_NPM"
    exit 1
fi

# 4. Check critical files exist
echo -e "\n📂 Checking critical files..."
REQUIRED_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "render.yaml"
    "render-build-production.sh"
    "render-start-production.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing critical file: $file"
        exit 1
    fi
done

# 5. Check render.yaml configuration
echo -e "\n⚙️ Validating render.yaml..."
if ! grep -q "services:" render.yaml; then
    echo "❌ render.yaml is missing services configuration"
    exit 1
else
    echo "✅ render.yaml contains services configuration"
fi

# 6. Check package.json scripts
echo -e "\n📜 Checking package.json scripts..."
REQUIRED_SCRIPTS=(
    "build"
    "start"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo "✅ Found $script script in package.json"
    else
        echo "❌ Missing required script in package.json: $script"
        exit 1
    fi
done

# 7. Test TypeScript compilation
echo -e "\n🔧 Testing TypeScript compilation..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation failed"
    exit 1
else
    echo "✅ TypeScript compilation successful"
fi

# 8. Check Git status
echo -e "\n📦 Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Warning: There are uncommitted changes"
else
    echo "✅ Git working directory is clean"
fi

# 9. Check build script permissions
echo -e "\n🔒 Checking build script permissions..."
if [ -x "render-build-production.sh" ]; then
    echo "✅ render-build-production.sh is executable"
else
    echo "❌ render-build-production.sh is not executable"
    exit 1
fi

# 10. Validate client dependencies
echo -e "\n📦 Validating client dependencies..."
cd client
npm install --dry-run --legacy-peer-deps || {
    echo "❌ Client dependency validation failed"
    exit 1
}
cd ..
echo "✅ Client dependencies validated"

echo -e "\n✨ Pre-deployment test complete! ✨"
echo "Completed: $(date)"