#!/bin/bash
# Casper x402 Crypto API - Quick Demo Script
# For hackathon demo video

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL=${API_URL:-"http://localhost:3000"}

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Casper x402 Crypto API - Live Demo                         ║"
echo "║   AI Agents Pay with CSPR via x402 Protocol                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for server
echo -e "\n${BLUE}[1/6]${NC} Checking API server..."
sleep 2
curl -s "$API_URL/health" | jq -r '.status' 2>/dev/null && echo "✓ Server is running" || echo "✗ Server not responding"

# Show API info
echo -e "\n${BLUE}[2/6]${NC} API Information..."
curl -s "$API_URL/" | jq '{
  name,
  version,
  network: .network,
  payment: .payment
}'

# Show pricing
echo -e "\n${BLUE}[3/6]${NC} Endpoint Pricing..."
curl -s "$API_URL/api/status" | jq '.pricing'

# Demo free endpoint
echo -e "\n${BLUE}[4/6]${NC} Testing Free Endpoint (Health)..."
curl -s "$API_URL/health" | jq '.'

# Demo paid endpoint (will show 402 in production, data in dev mode)
echo -e "\n${BLUE}[5/6]${NC} Testing Paid Endpoint (Crypto Price)..."
echo "Requesting BTC price..."
response=$(curl -s "$API_URL/api/crypto/price/BTC")
echo "$response" | jq '{
  status: if .error then "402 Payment Required" else "Success" end,
  data: .data,
  payment: .payment
}'

# MCP Info
echo -e "\n${BLUE}[6/6]${NC} MCP Server Tools..."
curl -s "http://localhost:3100/tools" 2>/dev/null | jq '.tools[] | {name, price, description}' || echo "MCP server not running (run: npm run mcp)"

echo -e "\n${GREEN}✓ Demo complete!${NC}"
echo ""
echo "Try it yourself:"
echo "  npm start          # Start API server"
echo "  npm run mcp       # Start MCP server"
echo ""
echo "Endpoints:"
echo "  curl $API_URL/api/crypto/price/BTC"
echo "  curl $API_URL/api/crypto/market"
echo "  curl $API_URL/api/security/token/0x..."
echo ""
echo "Hackathon: Casper Agentic Buildathon 2025"
echo "GitHub: github.com/qanzhi111/x402-api-casper"
