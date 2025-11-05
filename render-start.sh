#!/bin/bash
set -e

# Production environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Start the server
node dist/server/index-minimal.js