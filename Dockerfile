FROM node:20.19.1-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps && npm install --save-dev terser && cd ..

# Copy source code
COPY . .

# Build client and server
RUN cd client && npm run build && cd ..
RUN npx tsc -p tsconfig.production.json

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--experimental-modules --es-module-specifier-resolution=node"

# Expose port
EXPOSE 10000

# Start command
CMD ["node", "dist/server/index-minimal.js"]