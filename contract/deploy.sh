#!/bin/bash
# Casper Smart Contract Deployment Script
# For Casper Agentic Buildathon 2025

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Casper x402 API Logger Contract Deployment ===${NC}\n"

# Configuration
CHAIN_NAME=${1:-casper-test}
RPC_URL=${2:-"https://node.testnet.casper.network/rpc"}
NETWORK_NAME="casper-test"

echo "Configuration:"
echo "  Chain: $CHAIN_NAME"
echo "  RPC: $RPC_URL"
echo ""

# Check prerequisites
command -v cargo &> /dev/null || { echo "Error: cargo not found"; exit 1; }
command -v odra &> /dev/null || { echo "Warning: odra CLI not found, will install"; }

# Install odra if needed
if ! command -v odra &> /dev/null; then
    echo -e "${YELLOW}Installing Odra CLI...${NC}"
    cargo install odra-cli
fi

# Build the contract
echo -e "${GREEN}Building contract...${NC}"
cd contract
odra build

if [ -f "./target/wasm32-unknown-unknown/release/x402_api_logger.wasm" ]; then
    echo -e "${GREEN}✓ Contract built successfully${NC}"
    WASM_PATH="./target/wasm32-unknown-unknown/release/x402_api_logger.wasm"
else
    echo -e "${YELLOW}Trying alternative build path...${NC}"
    WASM_PATH=$(find ./target -name "*.wasm" | head -1)
fi

echo "  WASM: $WASM_PATH"

# Deploy instructions
echo ""
echo -e "${GREEN}=== Deployment Instructions ===${NC}"
echo ""
echo "1. Fund your account with Testnet CSPR:"
echo "   https://cspr.live/faucet"
echo ""
echo "2. Deploy using Casper CLI:"
echo "   casper-client put-deploy \\"
echo "     --node-address $RPC_URL \\"
echo "     --chain-name $CHAIN_NAME \\"
echo "     --payment-amount 100000000 \\"
echo "     --session-path $WASM_PATH \\"
echo "     --secret-key <your-secret-key.pem>"
echo ""
echo "3. After deployment, update your .env:"
echo "   CONTRACT_HASH=<deployed-contract-hash>"
echo ""
echo "4. Verify deployment:"
echo "   casper-client query-state-root-hash \\"
echo "     --node-address $RPC_URL"
echo ""
echo -e "${GREEN}=== Contract Functions ===${NC}"
echo ""
echo "  log_api_call(endpoint, amount)  - Log an API call"
echo "  get_total_calls()               - Get total call count"
echo "  get_total_revenue()             - Get total revenue"
echo "  get_recent_calls(limit)         - Get recent calls"
echo "  get_info()                      - Get contract info"
echo ""

echo -e "${GREEN}Deployment script complete!${NC}"
