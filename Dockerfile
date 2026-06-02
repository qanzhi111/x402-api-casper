FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY server.js ./
COPY mcp-server.js ./
COPY .env.example .env

# Expose ports
EXPOSE 3000 3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start API server (MCP runs separately if needed)
CMD ["node", "server.js"]
