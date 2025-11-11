#!/bin/bash
set -e

REPO_PATH="/workspaces/Inshallah786"

echo "=========================================="
echo "🔄 FINALIZING FOR DEPLOY"
echo "=========================================="

# Add all changes
git -C "$REPO_PATH" add -A

# Check status
echo ""
echo "📋 Changed files:"
git -C "$REPO_PATH" status --short | wc -l
echo "files to commit"

# Commit
echo ""
echo "💾 Committing build..."
git -C "$REPO_PATH" commit -m "build: finalize Node 20.19.0/npm 10.8.2 ESM-compatible build with Vite assets and TypeScript server compilation" || echo "No changes to commit"

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git -C "$REPO_PATH" push origin main || echo "⚠️ Push may have failed"

echo ""
echo "=========================================="
echo "✅ READY FOR RENDER DEPLOYMENT!"
echo "=========================================="
echo ""
echo "📦 Build artifacts:"
echo "  - Server: /dist/server/index-minimal.js"
echo "  - Assets: /dist/public/{index.html,404.html}"
echo ""
echo "🚀 Render will execute:"
echo "  Build: bash render-build-production.sh"
echo "  Start: node dist/server/index-minimal.js"
echo ""
