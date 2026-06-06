# x402-Crypto-API-Casper

> **Casper Network x402 Crypto API for AI Agents**
> 
> Pay for crypto data with CSPR via x402 protocol on Casper Testnet
> 
> Built for [Casper Agentic Buildathon 2026](https://dorahacks.io/hackathon/2202/detail) - $150,000 Prize Pool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Casper Testnet](https://img.shields.io/badge/Network-Casper_Testnet-42A5F5)](https://casper.network/)
[![Protocol: x402 v2](https://img.shields.io/badge/Protocol-x402_v2-7C4DFF)](https://x402.org/)
[![MCP Server](https://img.shields.io/badge/MCP-Supported-00BCD4)](https://modelcontextprotocol.io/)

---

## 🎯 Overview

This project implements the x402 payment protocol on the Casper Network, enabling AI agents to pay for API services using CSPR tokens. It's a direct adaptation of the [x402-crypto-api (Base)](https://github.com/qanzhi111/x402-crypto-api) for the Casper ecosystem.

### Key Features

- 🌐 **6 API Endpoints** - Crypto prices, market data, address analysis, token security, contract risk, and full investigation
- 💰 **x402 Payments** - Pay-per-request with CSPR/CEP-18 tokens via EIP-712 signatures
- 🤖 **MCP Server** - Native Model Context Protocol support for AI agents
- ⛓️ **On-Chain Logging** - Smart contract records all API usage on Casper Testnet
- 🚀 **Testnet Ready** - Fully functional on Casper Testnet

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Agent / Client                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ x402 Payment (EIP-712 signature)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    x402-Crypto-API-Casper                        │
│                      (Express.js Server)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              x402 Payment Middleware                      │   │
│  │  - Verifies PAYMENT-SIGNATURE header                     │   │
│  │  - Calls Casper x402 Facilitator                         │   │
│  │  - Logs usage to smart contract                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Crypto   │ │ Market  │ │ Security │ │Investi-  │           │
│  │ Prices   │ │ Data    │ │ Checks   │ │ gation   │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Casper Testnet                             │
│  ┌─────────────────────┐    ┌────────────────────────────────┐  │
│  │  x402 Facilitator  │    │   API Usage Logger Contract   │  │
│  │  (Go)              │    │   (Rust/Odra)                 │  │
│  │  - Verifies sigs   │    │   - Records API calls         │  │
│  │  - Settles on-chain│    │   - Tracks revenue            │  │
│  └─────────────────────┘    └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🏆 Casper Agentic Buildathon

This project is submitted for the **x402 Payments + AI Agents** category of the Casper Agentic Buildathon.

| Detail | Value |
|--------|-------|
| Hackathon | Casper Agentic Buildathon 2026 |
| Deadline | Open submission |
| Prize Pool | $150,000 |
| Category | Agentic AI + x402 Payments |
| Team | onchain-shadow |
| GitHub | qanzhi111 |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Casper Testnet account (get CSPR from [faucet](https://cspr.live/faucet))
- Optional: Casper x402 Facilitator running locally

### Installation

```bash
# Clone the repository
git clone https://github.com/qanzhi111/x402-api-casper.git
cd x402-api-casper

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Configuration

Edit `.env` with your settings:

```env
PORT=3000

# Casper Configuration
CASPER_PAYEE_ADDRESS=01<your-66-char-account-hash>
CASPER_FACILITATOR_URL=http://localhost:4022
CASPER_CAIP2_CHAIN_ID=casper:casper-test
CASPER_ASSET_PACKAGE=<64-char-hex-cep18-package-hash>

# Optional: Smart Contract (for on-chain logging)
CONTRACT_HASH=<deployed-contract-hash>
RPC_URL=https://node.testnet.casper.network/rpc

# Optional: API Keys for enhanced data
COINGECKO_API_KEY=
ETHERSCAN_API_KEY=
```

### Run the Server

```bash
# Start the API server
npm start

# Or in development mode
npm run dev

# Start the MCP server (separate terminal)
npm run mcp
```

### Test the Endpoints

```bash
# Health check (free)
curl http://localhost:3000/health

# API status (free)
curl http://localhost:3000/api/status

# Crypto price (requires x402 payment)
curl http://localhost:3000/api/crypto/price/BTC

# If payment required, you'll get 402 with instructions
```

## 📡 API Endpoints

### Free Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API information and endpoint listing |
| `GET /health` | Service health check |
| `GET /api/status` | API status and pricing |
| `GET /mcp` | MCP server information |

### Paid Endpoints (x402 Protected)

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/crypto/price/:symbol` | 1 CSPR | Real-time cryptocurrency price |
| `GET /api/crypto/market` | 2 CSPR | Top 20 crypto market overview |
| `GET /api/crypto/address/:address` | 5 CSPR | Ethereum address analysis |
| `GET /api/security/token/:address` | 5 CSPR | Token security & rug check |
| `GET /api/security/contract/:address` | 10 CSPR | Contract risk analysis |
| `GET /api/investigate/:address` | 25 CSPR | Full on-chain investigation |

## 💰 Payment Flow (x402 on Casper)

### 1. Client Request
```bash
curl http://localhost:3000/api/crypto/price/BTC
```

### 2. Server Returns 402
```json
{
  "x402_version": 2,
  "scheme": "exact",
  "network": "casper:casper-test",
  "asset": "native",
  "assetSymbol": "CSPR",
  "amount": "1000000000",
  "amountDisplay": "1.00 CSPR",
  "recipient": "01...",
  "instructions": {
    "step1": "Get CSPR from Casper Testnet faucet",
    "step2": "Sign an EIP-712 authorization",
    "step3": "Retry with PAYMENT-SIGNATURE header"
  }
}
```

### 3. Client Signs & Retries
```bash
# Sign EIP-712 authorization with CSPR
curl -H "PAYMENT-SIGNATURE: casper:01...:1000000000:<signature>" \
     http://localhost:3000/api/crypto/price/BTC
```

### 4. Server Verifies & Returns Data
```json
{
  "symbol": "BTC",
  "data": {
    "bitcoin": {
      "usd": 67542.00,
      "usd_24h_change": 2.45
    }
  },
  "timestamp": 1718000000000,
  "payment": {
    "amount": "1000000000",
    "asset": "CSPR",
    "deployHash": "abc123..."
  }
}
```

## 🤖 MCP Server Configuration

Add to your MCP client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "x402-casper-crypto": {
      "type": "http",
      "url": "http://localhost:3100"
    }
  }
}
```

### MCP Tools

| Tool | Price | Description |
|------|-------|-------------|
| `get_crypto_price` | 1 CSPR | Real-time crypto price |
| `get_market_overview` | 2 CSPR | Market data |
| `analyze_address` | 5 CSPR | Address analysis |
| `check_token_security` | 5 CSPR | Token security |
| `analyze_contract` | 10 CSPR | Contract analysis |
| `investigate_address` | 25 CSPR | Full investigation |

## ⛓️ Smart Contract (On-Chain Component)

The project includes a Casper smart contract (`contract/`) that logs all API usage on-chain.

### Functions

- `log_api_call(endpoint, amount)` - Record API call
- `get_total_calls()` - Total API calls
- `get_total_revenue()` - Total CSPR revenue
- `get_recent_calls(limit)` - Recent calls
- `get_info()` - Contract statistics

### Deploy to Testnet

```bash
cd contract

# Build
odra build

# Deploy (requires funded Casper account)
./deploy.sh casper-test https://node.testnet.casper.network/rpc
```

## 🧪 Testing

### Manual Testing

```bash
# Start server
npm start

# Test health
curl http://localhost:3000/health

# Test API (no payment - should return 402)
curl http://localhost:3000/api/crypto/price/ETH

# With payment (development mode simulates success)
curl -H "PAYMENT-SIGNATURE: dev:test:1000000000:testsig" \
     http://localhost:3000/api/crypto/price/ETH
```

### Integration with Casper x402 Facilitator

For full x402 verification:

1. Clone the Casper x402 facilitator:
```bash
git clone https://github.com/make-software/casper-x402.git
cd casper-x402
```

2. Start the facilitator:
```bash
# Configure .env with your testnet keys
go run ./apps/facilitator
```

3. Update your API server `.env`:
```env
CASPER_FACILITATOR_URL=http://localhost:4022
```

## 📁 Project Structure

```
x402-api-casper/
├── server.js              # Main API server (Express.js)
├── mcp-server.js          # MCP server for AI agents
├── package.json           # Node.js dependencies
├── .env.example          # Environment template
├── LICENSE               # MIT License
├── README.md            # This file
└── contract/            # Smart contract
    ├── src/lib.rs       # Rust contract code
    ├── Cargo.toml       # Rust dependencies
    ├── deploy.sh        # Deployment script
    └── README.md        # Contract documentation
```

## 🔗 Related Resources

- [Casper x402 Facilitator](https://github.com/make-software/casper-x402) - Official x402 for Casper
- [x402 Protocol](https://x402.org/) - Payment protocol specification
- [Casper Network](https://casper.network/) - Blockchain platform
- [MCP Specification](https://modelcontextprotocol.io/) - AI agent protocol
- [Casper SDK](https://github.com/make-software/casper-go-sdk) - Go SDK for Casper
- [Odra Framework](https://odra.dev/) - Smart contract framework

## 📜 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [make-software](https://github.com/make-software) for Casper x402 implementation
- [x402 Foundation](https://x402.org/) for the payment protocol
- [CoinGecko](https://www.coingecko.com/) for crypto data
- [Etherscan](https://etherscan.io/) for on-chain data

---

**Built for the Casper Agentic Buildathon 2026** 🎯

*AI agents pay per request. No API keys. No subscriptions. Just CSPR.*
