# Casper Agentic Buildathon - Submission Details

## Project: x402-Crypto-API-Casper

### Team Information
- **Team Name**: onchain-shadow
- **GitHub OAuth**: ktagent2026x
- **Registration Platform**: DoraHacks

### Project Category
- **Primary**: x402 Payments + AI Agents
- **Secondary**: DeFi & Payments Infrastructure

### Submission Links
- **GitHub Repository**: https://github.com/qanzhi111/x402-api-casper
- **Demo Video**: [To be added after recording]
- **Live Demo**: [To be deployed]

### Project Summary

This project implements the x402 payment protocol on Casper Network, enabling AI agents to pay for API services using CSPR tokens. It adapts the existing x402-crypto-api (Base/USDC) to the Casper ecosystem using CEP-18 tokens and Casper's native EIP-712 implementation.

### Key Features Delivered

1. **6 API Endpoints** with x402 payment protection
   - Crypto price lookup (1 CSPR)
   - Market data overview (2 CSPR)
   - Address analysis (5 CSPR)
   - Token security checks (5 CSPR)
   - Contract risk analysis (10 CSPR)
   - Full on-chain investigation (25 CSPR)

2. **MCP Server** for AI agent integration
   - Native Model Context Protocol support
   - Automatic x402 payment handling
   - 6 tool definitions for AI agents

3. **On-chain Component**
   - Smart contract (Rust/Odra) for usage logging
   - Records all API calls on Casper Testnet
   - Satisfies "transaction-producing on-chain component" requirement

4. **Casper x402 Integration**
   - Uses official Casper x402 Facilitator
   - EIP-712 signature verification
   - CEP-18 token payments on Casper Testnet

### Technical Stack

| Component | Technology |
|-----------|------------|
| API Server | Node.js/Express |
| Payment Protocol | x402 v2 |
| Blockchain | Casper Network (Testnet) |
| Smart Contract | Rust/Odra |
| AI Integration | MCP (Model Context Protocol) |
| Payment Verification | Casper x402 Facilitator |

### Hackathon Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Working prototype on Casper Testnet | ✅ | API server + x402 payments |
| Transaction-producing on-chain component | ✅ | Smart contract + usage logging |
| Open-source GitHub repo | ✅ | github.com/qanzhi111/x402-api-casper |
| Demo video | ⏳ | To be recorded |
| AI agent integration | ✅ | MCP server included |

### Prize Category: $150,000 Pool

This project competes in the **x402 Payments + AI Agents** category, which aligns with:
- x402 protocol implementation
- AI agent payment flows
- Micropayment infrastructure
- On-chain settlement

### Next Steps for Demo Video

1. Start API server: `npm start`
2. Start MCP server: `npm run mcp`
3. Test x402 payment flow with curl
4. Demonstrate MCP tool calls
5. Show smart contract on Casper Testnet

### Funding Received
- Casper Testnet CSPR: https://cspr.live/faucet
- No external funding required

---

**Submitted by**: onchain-shadow  
**Date**: June 2025  
**Hackathon**: Casper Agentic Buildathon 2025
