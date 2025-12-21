# ================================
# Multi-stage Dockerfile for AI Chatbot
# Builds both frontend and backend
# Build from root directory: docker build -t chatbot .
# ================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend (creates dist folder)
RUN npm run build

# ================================
# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy backend source
COPY backend/ ./

# Build backend TypeScript to JavaScript
RUN npm run build

# ================================
# Stage 3: Production Image
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built backend from builder
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend from builder
COPY --from=frontend-builder /app/frontend/dist ./public

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
