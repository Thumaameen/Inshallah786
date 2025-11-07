#!/bin/bash

# Start both backend and frontend servers for Replit development

# Export environment variables for backend (runs on port 8000)
export PORT=8000
export NODE_ENV=production
export HOST=0.0.0.0

# Start backend server in background
echo "🚀 Starting backend server on port 8000..."
node --loader ts-node/esm server/index.ts &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start frontend dev server on port 5000 (required for Replit webview)
echo "🎨 Starting frontend dev server on port 5000..."
cd client && VITE_API_URL=http://localhost:8000 npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
