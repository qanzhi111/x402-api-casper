#!/bin/bash
# Casper x402 Crypto API - Docker Deployment
# For Casper Agentic Buildathon 2025

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Casper x402 Crypto API - Docker Deployment Script          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
IMAGE_NAME="x402-crypto-api-casper"
CONTAINER_NAME="x402-casper-api"
PORT_API=${PORT_API:-3000}
PORT_MCP=${PORT_MCP:-3100}

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Build Docker image
build() {
    log_info "Building Docker image..."
    docker build -t $IMAGE_NAME .
    log_info "Image built successfully: $IMAGE_NAME"
}

# Run container
run() {
    log_info "Starting container..."
    
    # Check for .env file
    if [ ! -f .env ]; then
        log_warn "No .env file found, using defaults"
    fi
    
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT_API:$PORT_API \
        -p $PORT_MCP:$PORT_MCP \
        --env-file .env \
        $IMAGE_NAME
    
    log_info "Container started!"
    log_info "API Server: http://localhost:$PORT_API"
    log_info "MCP Server: http://localhost:$PORT_MCP"
}

# Stop and remove
stop() {
    log_info "Stopping container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    log_info "Container stopped"
}

# Show logs
logs() {
    docker logs -f $CONTAINER_NAME
}

# Show status
status() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log_info "Container is running"
        docker port $CONTAINER_NAME
    else
        log_warn "Container is not running"
    fi
}

# Help
help() {
    echo ""
    echo "Usage: ./docker.sh <command>"
    echo ""
    echo "Commands:"
    echo "  build   - Build Docker image"
    echo "  run     - Start container"
    echo "  stop    - Stop container"
    echo "  logs    - Show container logs"
    echo "  status  - Show container status"
    echo "  restart - Rebuild and restart"
    echo ""
    echo "Environment:"
    echo "  PORT_API=$PORT_API"
    echo "  PORT_MCP=$PORT_MCP"
    echo ""
}

# Main
case "${1:-help}" in
    build)
        build
        ;;
    run)
        run
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        build
        run
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    *)
        help
        ;;
esac
