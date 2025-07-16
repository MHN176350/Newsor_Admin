# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health check
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# # Create a script to substitute environment variables at runtime
# RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
#     echo 'set -e' >> /docker-entrypoint.sh && \
#     echo '' >> /docker-entrypoint.sh && \
#     echo '# Replace environment variables in JavaScript files' >> /docker-entrypoint.sh && \
#     echo 'find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL:-http://192.168.1.36:8000}|g" {} \;' >> /docker-entrypoint.sh && \
#     echo 'find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_GRAPHQL_URL_PLACEHOLDER|${VITE_GRAPHQL_URL:-http://192.168.1.36:8000/graphql}|g" {} \;' >> /docker-entrypoint.sh && \
#     echo '' >> /docker-entrypoint.sh && \
#     echo '# Start nginx' >> /docker-entrypoint.sh && \
#     echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
#     chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# # Use custom entrypoint
# ENTRYPOINT ["/docker-entrypoint.sh"]
