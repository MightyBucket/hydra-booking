
# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Debug: verify the client files exist inside the container
RUN set -eux; \
  pwd; ls -la; \
  ls -la client || true; \
  ls -la client/src || true; \
  test -f client/src/main.tsx

# Build the application (this will not include vite-dev.ts in the server bundle)
RUN npm run build

# Verify the build output
RUN ls -la dist/

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder (only the compiled server code and public assets)
COPY --from=builder /app/dist ./dist

# Verify what we copied
RUN ls -la dist/ && if [ -f dist/vite-dev.js ]; then rm dist/vite-dev.js; fi

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "run", "start"]
