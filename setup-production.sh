#!/bin/bash

# Install Node.js 20.19.1
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.19.1
nvm use 20.19.1
nvm alias default 20.19.1

# Verify Node.js version
node -v
npm -v

# Clean and install dependencies
rm -rf node_modules package-lock.json
npm install

# Run production build
npm run build:production